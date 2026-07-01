const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const variantFlags = require(path.join(root, "public", "patient360-flags.js"));
const edgecasesPath = path.join(root, "fixtures", "variant-flags-edgecases.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function applyMutation(config, mutation) {
  const mutated = variantFlags.cloneFlags();
  if (mutation === "removeVariantAssignment") {
    delete mutated.features.patientContextOrganizer.variants.B;
  } else if (mutation === "forbiddenCopy") {
    mutated.features.patientContextOrganizer.copyByVariant.A.body = "System pokazuje diagnoza jako gotowy wniosek.";
  } else if (mutation === "variantCVisible") {
    mutated.features.organizationalAiDrafting.variants.C = true;
    mutated.features.organizationalAiDrafting.surfacesByVariant.C = { demo: true, navigation: true, copy: true };
    mutated.features.organizationalAiDrafting.copyByVariant.C = {
      title: "Draft widoczny w wariancie C",
      body: "To powinno zostac zablokowane przez core-only wariant C.",
      disclaimer: "Test negatywny."
    };
  } else if (mutation === "missingDisclaimer") {
    delete mutated.features.doctorReadOnlyPacket.copyByVariant.B.disclaimer;
  } else if (mutation === "disabledReachable") {
    mutated.features.clinicalAssist.surfacesByVariant.C.navigation = true;
  } else {
    throw new Error(`Unknown mutation: ${mutation}`);
  }
  return mutated;
}

function validatePositive(testCase) {
  const config = variantFlags.cloneFlags();
  config.activeVariant = testCase.activeVariant;
  const result = variantFlags.validateVariantFlags(config);
  assert(result.valid, `${testCase.id}: expected valid flags, got ${result.errors.join("; ")}`);
  assert(variantFlags.aktywnyWariant(testCase.activeVariant, config) === testCase.activeVariant, `${testCase.id}: active variant mismatch`);
  (testCase.expectedEnabled || []).forEach((featureKey) => {
    assert(variantFlags.czyWlaczona(featureKey, testCase.activeVariant, config), `${testCase.id}: expected enabled ${featureKey}`);
    assert(variantFlags.copyDlaWariantu(featureKey, testCase.activeVariant, config), `${testCase.id}: expected visible copy for ${featureKey}`);
  });
  (testCase.expectedDisabled || []).forEach((featureKey) => {
    assert(!variantFlags.czyWlaczona(featureKey, testCase.activeVariant, config), `${testCase.id}: expected disabled ${featureKey}`);
    assert(variantFlags.copyDlaWariantu(featureKey, testCase.activeVariant, config) === null, `${testCase.id}: expected hidden copy for disabled ${featureKey}`);
  });
  return { id: testCase.id, variant: testCase.activeVariant };
}

function validateNegative(testCase) {
  const config = applyMutation(variantFlags.cloneFlags(), testCase.mutate);
  const result = variantFlags.validateVariantFlags(config);
  assert(!result.valid, `${testCase.id}: expected invalid flags`);
  if (testCase.expectedError) {
    assert(result.errors.includes(testCase.expectedError), `${testCase.id}: expected ${testCase.expectedError}, got ${result.errors.join("; ")}`);
  }
  if (testCase.expectedErrorIncludes) {
    assert(result.errors.some((error) => error.includes(testCase.expectedErrorIncludes)), `${testCase.id}: expected error containing ${testCase.expectedErrorIncludes}, got ${result.errors.join("; ")}`);
  }
  return { id: testCase.id, errors: result.errors };
}

function validateDemoWiring() {
  const demo = fs.readFileSync(path.join(root, "public", "demo.html"), "utf8");
  const app = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
  const flagsIndex = demo.indexOf("patient360-flags.js");
  const contractIndex = demo.indexOf("patient360-contract.js");
  const appIndex = demo.indexOf("app.js");
  assert(flagsIndex > -1, "demo.html should load patient360-flags.js");
  assert(contractIndex > -1 && contractIndex < flagsIndex, "demo.html should load contract before variant flags");
  assert(appIndex > flagsIndex, "demo.html should load variant flags before app.js");
  assert(demo.includes('id="legalVariantPanel"'), "demo.html should expose legal variant panel");
  assert(app.includes("PATIENT360_FLAGS") && app.includes("renderLegalVariantPanel"), "app.js should render Legal Variant Switchboard");
  assert(app.includes("data-legal-variant"), "app.js should expose A/B/C switch controls");
  assert(app.includes("czyWlaczona") && app.includes("copyDlaWariantu"), "demo renderer should use switchboard API");

  const config = variantFlags.cloneFlags();
  const visibleCounts = Object.fromEntries(variantFlags.LEGAL_VARIANTS.map((variant) => {
    const count = Object.keys(config.features).filter((featureKey) => {
      const item = config.features[featureKey];
      return variantFlags.czyWlaczona(featureKey, variant, config) &&
        item.surfacesByVariant?.[variant]?.demo === true &&
        variantFlags.copyDlaWariantu(featureKey, variant, config);
    }).length;
    return [variant, count];
  }));
  assert(visibleCounts.A > visibleCounts.B && visibleCounts.B > visibleCounts.C, "demo variants should visibly differ A > B > C");
  assert(variantFlags.copyDlaWariantu("organizationalAiDrafting", "C", config) === null, "variant C must hide organizational AI copy");
  assert(variantFlags.copyDlaWariantu("aiDraftingFull", "B", config) === null, "variant B must hide full AI drafting copy");
}

function main() {
  const edgecases = readJson(edgecasesPath);
  const baseResult = variantFlags.validateVariantFlags();
  assert(baseResult.valid, `default flags invalid: ${baseResult.errors.join("; ")}`);
  const positives = (edgecases.validCases || []).map(validatePositive);
  const negatives = (edgecases.negativeCases || []).map(validateNegative);
  validateDemoWiring();
  assert(positives.length >= 3, "Variant flags positives should cover A, B and C");
  assert(negatives.length >= 5, "Variant flags negatives should cover assignment, copy, C visibility, disclaimer and reachability");
  positives.forEach((item) => console.log(`${item.id}: valid variant=${item.variant}`));
  negatives.forEach((item) => console.log(`${item.id}: rejected errors=${item.errors.join(",")}`));
  console.log("Variant flags validation passed");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
