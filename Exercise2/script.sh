while inotifywait -e close_write shaders/*
do
    vertex_shader=$( cat shaders/vertexShader.vert )
    fragment_shader=$( cat shaders/fragmentShader.frag )

    # Add vertex shader
    echo "const vertexShader = \`" > $PWD/shaders.js
    echo "$vertex_shader" >> $PWD/shaders.js
    echo "\`" >> $PWD/shaders.js
    # Add fragment shader
    echo "const fragmentShader = \`" >> $PWD/shaders.js
    echo "$fragment_shader" >> $PWD/shaders.js
    echo "\`" >> $PWD/shaders.js
    # Add export
    echo "export {vertexShader, fragmentShader}" >> $PWD/shaders.js
done

