Add-Type -AssemblyName System.Drawing
$publicDir = (Get-Item "public").FullName
$srcPath = Join-Path $publicDir "adriannis.png"
$bakPath = Join-Path $publicDir "adriannis.original.png"

if (-not (Test-Path $bakPath)) {
    Copy-Item $srcPath $bakPath
}

$src = [System.Drawing.Image]::FromFile($srcPath)
$cropY = 175
$newHeight = $src.Height - $cropY
$dest = New-Object System.Drawing.Bitmap($src.Width, $newHeight)
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle(0, $cropY, $src.Width, $newHeight)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $src.Width, $newHeight)
$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$src.Dispose()

$tempPath = Join-Path $publicDir "adriannis.temp.png"
$dest.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dest.Dispose()

Move-Item -Path $tempPath -Destination $srcPath -Force
Write-Host "Crop complete: new dimensions $($destRect.Width)x$($newHeight)"
