param()
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskFiles = @(
    @('mysql-connector-j-8.0.33.jar', 'https://repo.maven.apache.org/maven2/com/mysql/mysql-connector-j/8.0.33/mysql-connector-j-8.0.33.jar', 'Todo/lib', 'e2a3b2fc726a1ac64e998585db86b30fa8bf3f706195b78bb77c5f99bf877bd9'),
    @('mysql-connector-j-8.0.33.jar', 'https://repo.maven.apache.org/maven2/com/mysql/mysql-connector-j/8.0.33/mysql-connector-j-8.0.33.jar', 'TodoJSP/src/main/webapp/WEB-INF/lib', 'e2a3b2fc726a1ac64e998585db86b30fa8bf3f706195b78bb77c5f99bf877bd9'),
    @('javax.servlet.jsp.jstl-1.2.5.jar', 'https://repo.maven.apache.org/maven2/org/glassfish/web/javax.servlet.jsp.jstl/1.2.5/javax.servlet.jsp.jstl-1.2.5.jar', 'TodoJSP/src/main/webapp/WEB-INF/lib', '1019e72c0f1aeded026e11c7ba26f0ced9a2f1f68075153dd74e9ede8dd3b601'),
    @('javax.servlet.jsp.jstl-api-1.2.1.jar', 'https://repo.maven.apache.org/maven2/javax/servlet/jsp/jstl/javax.servlet.jsp.jstl-api/1.2.1/javax.servlet.jsp.jstl-api-1.2.1.jar', 'TodoJSP/src/main/webapp/WEB-INF/lib', 'f8fe158caa6c220bbc2d94da08773af101909da02ff61725392b7c603dd693e0')
)
foreach ($taskFile in $taskFiles) {
    $taskDir = Join-Path $taskRoot $taskFile[2]
    New-Item -ItemType Directory -Force $taskDir | Out-Null
    $taskDest = Join-Path $taskDir $taskFile[0]
    if (-not (Test-Path -LiteralPath $taskDest)) { Invoke-WebRequest -Uri $taskFile[1] -OutFile $taskDest }
    if ((Get-FileHash -LiteralPath $taskDest -Algorithm SHA256).Hash -ne $taskFile[3]) { throw "SHA256 mismatch: $taskDest" }
    Write-Host "Ready: $($taskFile[2])/$($taskFile[0])"
}
