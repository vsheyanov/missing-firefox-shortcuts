rm ./build/configure-shortcuts.zip; 
(cd source && zip -r -FS ../build/configure-shortcuts.zip * --exclude '*.git*')
