param(
    [string]$JavaHome = $env:JAVA_HOME,
    [string]$TomcatHome = $env:CATALINA_HOME,
    [switch]$ConsoleOnly
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskJavac = if ($JavaHome) { Join-Path $JavaHome 'bin/javac.exe' } else { 'javac' }
$taskJar = if ($JavaHome) { Join-Path $JavaHome 'bin/jar.exe' } else { 'jar' }
function Build-Classes($source, $output, $classpath) {
    New-Item -ItemType Directory -Force $output | Out-Null
    # Compile every source; distribution ZIPs contain no class files.
    $taskSources = @(Get-ChildItem -LiteralPath $source -Recurse -Filter *.java | ForEach-Object { $_.FullName })
    & $taskJavac --release 17 -encoding UTF-8 -cp $classpath -d $output $taskSources
    if ($LASTEXITCODE -ne 0) { throw "Compilation failed: $source" }
    $taskConfig = Join-Path $source 'db.properties'
    if (Test-Path -LiteralPath $taskConfig) { Copy-Item -LiteralPath $taskConfig -Destination $output -Force }
    elseif (Test-Path -LiteralPath (Join-Path $output 'db.properties')) { Remove-Item -LiteralPath (Join-Path $output 'db.properties') }
}
Build-Classes (Join-Path $taskRoot 'Todo/com.todo') (Join-Path $taskRoot 'Todo/bin') (Join-Path $taskRoot 'Todo/lib/*')
if (-not $ConsoleOnly) {
    if (-not $TomcatHome -or -not (Test-Path (Join-Path $TomcatHome 'lib/servlet-api.jar'))) {
        throw 'Set -TomcatHome to an Apache Tomcat 9 directory.'
    }
    $taskWeb = Join-Path $taskRoot 'TodoJSP/src/main/webapp'
    Build-Classes (Join-Path $taskRoot 'TodoJSP/com.todojsp') (Join-Path $taskWeb 'WEB-INF/classes') (Join-Path $TomcatHome 'lib/servlet-api.jar')
    New-Item -ItemType Directory -Force (Join-Path $taskRoot '.local') | Out-Null
    & $taskJar --create --file (Join-Path $taskRoot '.local/TodoJSP.war') -C $taskWeb .
    if ($LASTEXITCODE -ne 0) { throw 'WAR creation failed.' }
    Write-Host 'WAR: .local/TodoJSP.war'
}
Write-Host 'Java 17 compilation passed.'
