param(
    [switch]$NoSsl,
    [switch]$SkipVerify,
    [switch]$PreparePackage,
    [string]$HostName = 'ftp.server551887.nazwa.pl',
    [string]$UserName = 'server551887_pacjent360',
    [string]$RemoteRoot = '/',
    [string]$BaseUrl = 'https://pacjent360.com.pl'
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$LocalRoot = Join-Path $RepoRoot 'dist\upload-ready'
$LogPath = Join-Path $RepoRoot 'dist\nazwa-upload.log'
$UseSsl = -not $NoSsl
$oldCertificateCallback = [System.Net.ServicePointManager]::ServerCertificateValidationCallback

function Write-Step {
    param([string]$Message)
    Write-Host ''
    Write-Host $Message -ForegroundColor Cyan
}

function ConvertTo-FtpPath {
    param([string]$Path)
    $normalized = $Path -replace '\\', '/'
    $parts = $normalized.Split('/') | Where-Object { $_ -ne '' }
    if ($parts.Count -eq 0) {
        return '/'
    }
    return '/' + (($parts | ForEach-Object { [uri]::EscapeDataString($_) }) -join '/')
}

function Join-FtpPath {
    param(
        [string]$Base,
        [string]$Relative
    )
    $cleanBase = '/' + (($Base -replace '\\', '/').Trim('/'))
    if ($cleanBase -eq '/') {
        $cleanBase = ''
    }
    $cleanRelative = ($Relative -replace '\\', '/').Trim('/')
    if ([string]::IsNullOrWhiteSpace($cleanRelative)) {
        return $(if ($cleanBase) { $cleanBase } else { '/' })
    }
    return "$cleanBase/$cleanRelative"
}

function New-FtpRequest {
    param(
        [string]$RemotePath,
        [string]$Method
    )
    $ftpPath = ConvertTo-FtpPath $RemotePath
    $uri = "ftp://$HostName$ftpPath"
    $request = [System.Net.FtpWebRequest]::Create($uri)
    $request.Method = $Method
    $request.Credentials = $script:Credential
    $request.UseBinary = $true
    $request.UsePassive = $true
    $request.EnableSsl = $script:UseSsl
    $request.KeepAlive = $false
    return $request
}

function Test-FtpDirectory {
    param([string]$RemotePath)
    try {
        $request = New-FtpRequest -RemotePath $RemotePath -Method ([System.Net.WebRequestMethods+Ftp]::ListDirectory)
        $response = $request.GetResponse()
        $response.Close()
        return $true
    }
    catch {
        return $false
    }
}

function Ensure-FtpDirectory {
    param([string]$RemotePath)
    if ([string]::IsNullOrWhiteSpace($RemotePath) -or $RemotePath -eq '/') {
        return
    }
    try {
        $request = New-FtpRequest -RemotePath $RemotePath -Method ([System.Net.WebRequestMethods+Ftp]::MakeDirectory)
        $response = $request.GetResponse()
        $response.Close()
    }
    catch {
        # Directory already exists or the FTP account is chrooted.
    }
}

function Upload-FtpFile {
    param(
        [string]$LocalPath,
        [string]$RemotePath
    )
    $bytes = [System.IO.File]::ReadAllBytes($LocalPath)
    $request = New-FtpRequest -RemotePath $RemotePath -Method ([System.Net.WebRequestMethods+Ftp]::UploadFile)
    $request.ContentLength = $bytes.Length
    $stream = $request.GetRequestStream()
    try {
        $stream.Write($bytes, 0, $bytes.Length)
    }
    finally {
        $stream.Close()
    }
    $response = $request.GetResponse()
    $response.Close()
}

function Find-RemoteRoot {
    if (Test-FtpDirectory -RemotePath $RemoteRoot) {
        return $RemoteRoot
    }
    return $null
}

function Assert-UploadPackage {
    if (-not (Test-Path -LiteralPath $LocalRoot)) {
        throw "Nie znaleziono katalogu upload-ready: $LocalRoot. Uruchom najpierw tools\validate-go-live.ps1 albo dodaj parametr -PreparePackage."
    }

    $script:Files = Get-ChildItem -LiteralPath $LocalRoot -Recurse -File | Sort-Object FullName
    if ($script:Files.Count -eq 0) {
        throw "Katalog upload-ready jest pusty: $LocalRoot"
    }
}

function Invoke-PackagePreparation {
    Write-Step 'Przygotowanie paczki hostingowej'
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $RepoRoot 'tools\prepare-hosting-upload.ps1')
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $RepoRoot 'tools\write-upload-manifest.ps1')
}

function Invoke-DeployedVerification {
    if ($SkipVerify) {
        Write-Host 'Pominieto weryfikacje domeny (-SkipVerify).' -ForegroundColor Yellow
        return
    }

    Write-Step 'Weryfikacja domeny po uploadzie'
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $RepoRoot 'tools\verify-deployed-site.ps1') `
        -BaseUrl $BaseUrl `
        -CompareLocalPackage `
        -LocalPublicPath $LocalRoot
}

try {
    if ($PreparePackage) {
        Invoke-PackagePreparation
    }

    Assert-UploadPackage

    if ($script:UseSsl) {
        # Some nazwa.pl FTP endpoints present a certificate that does not match
        # the ftp.serverNNNNNN.nazwa.pl host exactly. TLS is still required here;
        # this accepts the hosting certificate for this PowerShell process.
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
    }

    Write-Step 'Pacjent360 - upload na nazwa.pl'
    Write-Host "Host: $HostName"
    Write-Host "Konto: $UserName"
    Write-Host "Katalog lokalny: $LocalRoot"
    Write-Host "Katalog zdalny: $RemoteRoot"
    Write-Host "Tryb: $(if ($script:UseSsl) { 'FTPS' } else { 'FTP bez TLS' })"
    Write-Host "Pliki do wyslania: $($script:Files.Count)"
    Write-Host ''
    Write-Host 'Wpisz haslo FTP. Nie bedzie widoczne i nie zostanie zapisane.' -ForegroundColor Yellow
    $securePassword = Read-Host 'Haslo FTP' -AsSecureString
    $script:Credential = New-Object System.Net.NetworkCredential($UserName, $securePassword)

    "Pacjent360 upload start $(Get-Date -Format s)" | Set-Content -LiteralPath $LogPath -Encoding UTF8

    $resolvedRemoteRoot = Find-RemoteRoot
    if (-not $resolvedRemoteRoot -and $script:UseSsl) {
        Write-Host ''
        Write-Host 'FTPS nie potwierdzil katalogu zdalnego.' -ForegroundColor Yellow
        Write-Host 'Nazwa.pl w tym koncie moze wymagac zwyklego FTP. To oznacza brak szyfrowania polaczenia FTP.' -ForegroundColor Yellow
        $fallback = Read-Host 'Jesli chcesz sprobowac bez TLS, wpisz TAK'
        if ($fallback -eq 'TAK') {
            $script:UseSsl = $false
            [System.Net.ServicePointManager]::ServerCertificateValidationCallback = $oldCertificateCallback
            $resolvedRemoteRoot = Find-RemoteRoot
        }
    }

    if (-not $resolvedRemoteRoot) {
        throw "Nie udalo sie potwierdzic katalogu zdalnego. Sprawdz haslo FTP, konto lub katalog docelowy."
    }

    Write-Host "Potwierdzony katalog zdalny: $resolvedRemoteRoot" -ForegroundColor Cyan
    "Remote root: $resolvedRemoteRoot" | Add-Content -LiteralPath $LogPath -Encoding UTF8
    "Mode: $(if ($script:UseSsl) { 'FTPS' } else { 'FTP' })" | Add-Content -LiteralPath $LogPath -Encoding UTF8

    $directorySet = New-Object 'System.Collections.Generic.HashSet[string]'
    foreach ($file in $script:Files) {
        $relative = $file.FullName.Substring($LocalRoot.Length).TrimStart('\', '/')
        $relative = $relative -replace '\\', '/'
        $parent = Split-Path -Parent $relative
        if ($parent) {
            $current = ''
            foreach ($segment in (($parent -replace '\\', '/').Split('/') | Where-Object { $_ })) {
                $current = if ($current) { "$current/$segment" } else { $segment }
                [void]$directorySet.Add($current)
            }
        }
    }

    foreach ($dir in ($directorySet | Sort-Object)) {
        Ensure-FtpDirectory -RemotePath (Join-FtpPath -Base $resolvedRemoteRoot -Relative $dir)
    }

    $index = 0
    foreach ($file in $script:Files) {
        $index++
        $relative = $file.FullName.Substring($LocalRoot.Length).TrimStart('\', '/')
        $relative = $relative -replace '\\', '/'
        $remotePath = Join-FtpPath -Base $resolvedRemoteRoot -Relative $relative
        Write-Host ("[{0}/{1}] {2}" -f $index, $script:Files.Count, $relative)
        Upload-FtpFile -LocalPath $file.FullName -RemotePath $remotePath
        "OK $relative" | Add-Content -LiteralPath $LogPath -Encoding UTF8
    }

    "Pacjent360 upload done $(Get-Date -Format s)" | Add-Content -LiteralPath $LogPath -Encoding UTF8
    Write-Step 'Upload zakonczony'
    Write-Host "Log: $LogPath"

    Invoke-DeployedVerification
    Write-Step 'Gotowe'
}
catch {
    $message = $_.Exception.Message
    if (Test-Path -LiteralPath (Split-Path -Parent $LogPath)) {
        "ERROR $message" | Add-Content -LiteralPath $LogPath -Encoding UTF8
    }
    Write-Host ''
    Write-Host 'UPLOAD ERROR' -ForegroundColor Red
    Write-Host $message -ForegroundColor Red
    Write-Host "Log: $LogPath"
    exit 1
}
finally {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = $oldCertificateCallback
}
