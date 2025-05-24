$chapters = @(
    "courses\arabic\chapters\a1\a1-chapter1.html",
    "courses\math\chapters\a1\ch1-basic-arithmetic.html",
    "courses\science\chapters\a1\science-basics.html"
)

foreach ($chapter in $chapters) {
    $content = Get-Content $chapter -Raw
    $content = $content -replace '</body>', '<script src="../../../../js/admin.js"></script></body>'
    Set-Content $chapter -Value $content
}
