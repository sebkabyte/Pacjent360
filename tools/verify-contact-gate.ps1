param(
  [string]$Domain = "pacjent360.com.pl",
  [string[]]$Aliases = @("security", "kontakt"),
  [switch]$DnsOnly,
  [switch]$ReceiptConfirmed,
  [string]$MonitorOwner = ""
)

$ErrorActionPreference = "Stop"

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )
  if (-not $Condition) {
    throw $Message
  }
}

function Get-MxRecords {
  param([string]$Name)

  $records = New-Object System.Collections.Generic.List[string]

  if (Get-Command Resolve-DnsName -ErrorAction SilentlyContinue) {
    try {
      Resolve-DnsName -Name $Name -Type MX -ErrorAction Stop |
        Where-Object { $_.NameExchange } |
        ForEach-Object { $records.Add("$($_.Preference) $($_.NameExchange)") }
    } catch {
      # Fall back to nslookup below.
    }
  }

  if ($records.Count -eq 0 -and (Get-Command nslookup -ErrorAction SilentlyContinue)) {
    try {
      $output = & nslookup -type=mx $Name 2>&1
      foreach ($line in $output) {
        if ($line -match "mail exchanger = (?<host>.+)$") {
          $records.Add($Matches.host.Trim())
        }
      }
    } catch {
      # The caller handles the empty result.
    }
  }

  return $records | Sort-Object -Unique
}

$domainValue = $Domain.Trim().ToLowerInvariant()
Assert-True ($domainValue.Length -gt 0) "Domain is required"
Assert-True ($Aliases.Count -gt 0) "At least one alias is required"

$mxRecords = @(Get-MxRecords -Name $domainValue)
Assert-True ($mxRecords.Count -gt 0) "No MX records found for $domainValue. Configure mail service before public repo/go-live."

Write-Host "MX records found for ${domainValue}:"
$mxRecords | ForEach-Object { Write-Host "- $_" }

Write-Host ""
Write-Host "Required aliases:"
foreach ($alias in $Aliases) {
  $address = "$($alias.Trim().ToLowerInvariant())@$domainValue"
  Write-Host "- $address"
}

Write-Host ""
Write-Host "Manual receipt checklist:"
Write-Host "1. Send a test email from an external mailbox to each required alias."
Write-Host "2. Use a neutral subject, for example: Pacjent360 contact gate test."
Write-Host "3. Do not include patient data, medical details, passwords or private files."
Write-Host "4. Confirm the message arrives in the monitored mailbox and is not only in spam."
Write-Host "5. Reply from the monitored mailbox and confirm the external sender receives the reply."
Write-Host "6. Record date, aliases, monitor owner and result in docs/deployment/GO_LIVE_CHECKLIST.md or a private handover note."

if ($DnsOnly) {
  Write-Host ""
  Write-Host "DNS-only contact precheck passed. This does not prove alias delivery or monitoring."
  exit 0
}

Assert-True $ReceiptConfirmed "Manual receipt/reply confirmation is required. Re-run with -ReceiptConfirmed after testing both aliases."
Assert-True ($MonitorOwner.Trim().Length -gt 0) "MonitorOwner is required when -ReceiptConfirmed is used."

Write-Host ""
Write-Host "Contact alias gate passed for $domainValue."
Write-Host "Monitor owner: $MonitorOwner"
Write-Host "External go-live gate can be marked done only after this evidence is copied into the checklist/handover."
