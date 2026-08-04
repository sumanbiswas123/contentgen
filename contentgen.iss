[Setup]
AppName=ContentGen Native
AppVersion=2.0.0
AppPublisher=ContentGen
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=commandline
DefaultDirName={localappdata}\ContentGen
DisableDirPage=yes
DisableReadyPage=yes
DisableProgramGroupPage=yes
DisableWelcomePage=no
DisableFinishedPage=yes
CreateUninstallRegKey=yes
Uninstallable=yes
UninstallDisplayName=ContentGen Native
UninstallDisplayIcon={app}\contentgen.exe
OutputDir=.
OutputBaseFilename=ContentGenSetup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern

CloseApplications=no
RestartApplications=no

[Files]
Source: "zig-out\bin\contentgen.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{userdesktop}\ContentGen Native"; Filename: "{app}\contentgen.exe"; IconFilename: "{app}\contentgen.exe"
Name: "{userprograms}\ContentGen Native"; Filename: "{app}\contentgen.exe"; IconFilename: "{app}\contentgen.exe"

[Registry]
Root: HKCU; Subkey: "Software\ContentGen"; ValueType: string; ValueName: "ApplicationName"; ValueData: "ContentGen Native"

[Run]
Filename: "{app}\contentgen.exe"; Description: "Launch ContentGen Native"; Flags: nowait

[UninstallRun]
Filename: "taskkill.exe"; Parameters: "/f /im contentgen.exe"; Flags: runhidden waituntilterminated

[Code]
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  Exec('taskkill.exe', '/f /im contentgen.exe', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;
