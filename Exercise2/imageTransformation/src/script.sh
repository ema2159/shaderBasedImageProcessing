while inotifywait -e close_write shaders/*
do
    vertex_shader=$( cat shaders/vertexShader.vert )
    fragment_shader=$( cat shaders/fragmentShader.frag )

    # Add vertex shader
    echo "const vertexShader = \`" > shaders.js
    echo "$vertex_shader" >> shaders.js
    echo "\`" >> shaders.js
    # Add fragment shader
    echo "const fragmentShader = \`" >> shaders.js
    echo "$fragment_shader" >> shaders.js
    echo "\`" >> shaders.js
    # Add export
    echo "export {vertexShader, fragmentShader}" >> shaders.js
done

