Gem::Specification.new do |s|
    s.name        = "8-bit-ascii-theme"
    s.version     = "1.0.0"
    s.summary     = "8 bit ascii theme for my Jekyll blog"
    s.description = "8 bit theme gem"
    s.authors     = ["Vadym Serdiuk"]
    s.license       = "MIT"
    s.metadata["plugin_type"] = "theme"
    s.files                   = `git ls-files -z`.split("\x0").select do |f|
      f.match(%r{^(assets|_(data|includes|layouts|css)/|(LICENSE|README|CHANGELOG)((\.(txt|md|markdown|ico|css)|$)))}i)
    end
  end
