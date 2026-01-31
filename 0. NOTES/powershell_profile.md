# Microsoft.PowerShell_profile.ps1

```powershell
Clear-Host
Set-ExecutionPolicy -Scope CurrentUser Unrestricted
Set-PSReadLineOption -EditMode Vi
Set-PSReadLineOption -ViModeIndicator Cursor

function Set-BunPath {
  # The path to the bun executable
  $bunPath = "$HOME\.bun\bin"

  # Get the current PATH for the User scope
  $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")

  # Split the path into an array and check if our bun path is already present
  # The [System.StringSplitOptions]::RemoveEmptyEntries is important for clean results
  $pathEntries = $userPath.Split([IO.Path]::PathSeparator, [System.StringSplitOptions]::RemoveEmptyEntries)

  if ($pathEntries -notcontains $bunPath) {
    # If it's missing, append the new path
    $newPath = "$userPath;$bunPath"
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    
    # Optional - output a message
    #Write-Host "Added '$bunPath' to your User PATH. Please restart PowerShell." -ForegroundColor Green
  }
  else {
    # If it's already there, do nothing
    # Optional - output a message
    #Write-Host "'$bunPath' is already in your User PATH." -ForegroundColor Yellow
  }
}

function See-AnsiColors {
  
  $esc = [char]27
  
  foreach($digit in 0..255) {
    Write-Host (" $esc[48;5;${digit}m " + ($digit.ToString().PadLeft(3)) + " $esc[0m") -NoNewline
    if (($digit + 1) % 8 -eq 0) { Write-Host "" }
  }
}

function Get-AnsiColor {
    param (
        [Parameter(Mandatory=$true)]
        [ValidateRange(0, 255)]
        [int]$ColorCode,
        
        [Parameter()]
        [switch]$Background
    )

    $esc = [char]27
    # 38 is Foreground, 48 is Background
    $type = if ($Background) { "48" } else { "38" }
    
    return "$esc[$($type);5;${ColorCode}m"
}

#function prompt {
#    Write-Host "PS " -NoNewline -ForegroundColor Cyan
#    Write-Host "$($executionContext.SessionState.Path.CurrentLocation)" -NoNewline -ForegroundColor Yellow
#    return "> "
#}

function prompt {
    # Define Colors
    $esc      = [char]27
    $cyan     = Get-AnsiColor -ColorCode 6
    $green    = Get-AnsiColor -ColorCode 2
    $orange   = Get-AnsiColor -ColorCode 5
    $red      = Get-AnsiColor -ColorCode 1
    $reset    = "$esc[0m"
    $newLine  = "`n"

    # Define Nerd Font Glyphs (Symbols)
    # Using the actual characters is more reliable
    $bubbleLeft     = ""
    $bubbleRight    = ""
    $fullBlock      = "█"
    $leftShoulder   = "╭"
    $connector      = "├"
    $leftElbow      = "╰"
    $horzLine       = "─"
    $vertLine       = "│" 
    $folderIcon     = "📂"
    $triangle       = "▶"
    $promptIcon     = "❯"
    $space          = " "

    # Build Prompt Segments

    # Segment 1: Current Directory Path
    # Replaces home directory path with a '~'
    $shortPath      = $pwd.Path -replace "^$([regex]::Escape($HOME))", '~'
    
    $leftSide       = "$orange$bubbleLeft$fullBlock$reset"
    $middle         = "$space$folderIcon$space$cyan$shortPath$reset"
    $rightSide      = "$space$orange$fullBlock$bubbleRight$reset"
    $styledPath     = "$space$leftSide$middle$rightSide"

    $time = Get-Date -Format "HH:mm:ss"
    $styledTime = ""

    $pathSegment    = "$green$leftShoulder$horzLine$reset$styledPath"
    
    # Segment 2: Vertical Line
    $vertSegment    = "$green$vertLine$reset"
    
    # Segment 3: Prompt
    $promptSegment  = "$green$leftElbow$horzLine$promptIcon$reset$space"
    
    
    <# Assemble Final Prompt #>
    
    # First line of the prompt
    $firstLine  = $pathSegment

    # Second line of the prompt
    $secondLine = $vertSegment
    
    # Third line of the prompt
    $thirdline  = $promptSegment

    # Combine the two lines and return the final prompt
    return "$firstLine$newLine$secondLine$newLine$thirdline"
}

# Set Paths
$pth = (
  "$Home\.bin",
  "$HOME\.bun\bin",
  "$env:PATH"
)

$env:PATH = ($pth -Join ';')

# Automatically set bun path when profile loads
#Set-BunPath

# Automatically execute winfetch.ps1 from the current directory
#& "$PSScriptRoot\winfetch.ps1"
```
