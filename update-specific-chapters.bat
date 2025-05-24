@echo off
echo Updating specific chapter pages with enhanced styles and Back to Home button...

REM English A1 Chapter 1
echo Processing English A1 Chapter 1...
powershell -Command "(Get-Content 'courses\english\chapters\a1\a1-chapter1.html') -replace '<link rel=\"stylesheet\" href=\"..\/..\/..\/css\/styles.css\">', '<link rel=\"stylesheet\" href=\"..\/..\/..\/..\/css\/styles.css\">`n    <link rel=\"stylesheet\" href=\"..\/..\/..\/..\/css\/enhanced-styles.css\">' | Set-Content 'courses\english\chapters\a1\a1-chapter1.html'"

REM German A1 Chapter 1
echo Processing German A1 Chapter 1...
powershell -Command "(Get-Content 'courses\german\chapters\a1\a1-chapter1.html') -replace '<link rel=\"stylesheet\" href=\"..\/..\/..\/css\/styles.css\">', '<link rel=\"stylesheet\" href=\"..\/..\/..\/..\/css\/styles.css\">`n    <link rel=\"stylesheet\" href=\"..\/..\/..\/..\/css\/enhanced-styles.css\">' | Set-Content 'courses\german\chapters\a1\a1-chapter1.html'"

REM Math A1 Chapter 1
echo Processing Math A1 Chapter 1...
powershell -Command "(Get-Content 'courses\math\chapters\a1\ch1-basic-arithmetic.html') -replace '<link rel=\"stylesheet\" href=\"..\/..\/..\/css\/styles.css\">', '<link rel=\"stylesheet\" href=\"..\/..\/..\/..\/css\/styles.css\">`n    <link rel=\"stylesheet\" href=\"..\/..\/..\/..\/css\/enhanced-styles.css\">' | Set-Content 'courses\math\chapters\a1\ch1-basic-arithmetic.html'"

REM Science A1 Chapter 1
echo Processing Science A1 Chapter 1...
powershell -Command "(Get-Content 'courses\science\chapters\a1\science-basics.html') -replace '<link rel=\"stylesheet\" href=\"..\/..\/..\/css\/styles.css\">', '<link rel=\"stylesheet\" href=\"..\/..\/..\/..\/css\/styles.css\">`n    <link rel=\"stylesheet\" href=\"..\/..\/..\/..\/css\/enhanced-styles.css\">' | Set-Content 'courses\science\chapters\a1\science-basics.html'"

echo Updates completed successfully!
