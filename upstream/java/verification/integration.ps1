param(
    [Parameter(Mandatory=$true)][string]$JavaHome,
    [Parameter(Mandatory=$true)][string]$TomcatHome
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
Push-Location $taskRoot
try {
    & (Join-Path $taskRoot 'scripts/build.ps1') -JavaHome $JavaHome -TomcatHome $TomcatHome
    $taskTemplate = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'CrudChecks.java.template'))
    $taskUtf8 = New-Object System.Text.UTF8Encoding($false)
    $taskChecks = @(
        @('', 'ConsoleChecks', 'Todo/bin', 'Todo/lib/*'),
        @('com.todojsp.', 'WebChecks', 'TodoJSP/src/main/webapp/WEB-INF/classes', 'TodoJSP/src/main/webapp/WEB-INF/lib/*')
    )
    foreach ($taskCheck in $taskChecks) {
        $taskSource = Join-Path $taskRoot ('.local/' + $taskCheck[1] + '.java')
        [IO.File]::WriteAllText($taskSource, $taskTemplate.Replace('PREFIX', $taskCheck[0]).Replace('CLASSNAME', $taskCheck[1]), $taskUtf8)
        $taskClasspath = $taskCheck[2] + ';' + $taskCheck[3]
        & (Join-Path $JavaHome 'bin/javac.exe') --release 17 -encoding UTF-8 -cp $taskClasspath -d .local $taskSource
        if ($LASTEXITCODE -ne 0) { throw 'Test compilation failed.' }
        & (Join-Path $JavaHome 'bin/java.exe') '-Dfile.encoding=UTF-8' -cp ('.local;' + $taskClasspath) $taskCheck[1]
        if ($LASTEXITCODE -ne 0) { throw 'Integration checks failed.' }
    }
} finally { Pop-Location }
