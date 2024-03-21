
function main() {

    var CANVAS = document.getElementById("your_canvas");
  
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
  
  
    /*========================= GET WEBGL CONTEXT ========================= */
    var GL;
    try {
      GL = CANVAS.getContext("webgl2", {antialias: false});
    } catch (e) {
      alert("WebGL context cannot be initialized");
      return false;
    }
  
    /*========================= SHADERS ========================= */
    /*jshint multistr: true */
    var shader_vertex_source = "\n\
  attribute vec2 position;\n\
  attribute vec3 color;\n\
  attribute vec2 offset;\n\
  \n\
  varying vec3 vColor;\n\
  void main(void) {\n\
  gl_Position = vec4(position+offset, 0., 1.);\n\
  vColor = color;\n\
  }";
  
  
    var compile_shader = function(source, type, typeString) {
      var shader = GL.createShader(type);
      GL.shaderSource(shader, source);
      GL.compileShader(shader);
      if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
        return false;
      }
      return shader;
    };
  
    var shader_vertex = compile_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment_textarea = document.getElementById('fragmentSourceTextarea');
  
    var _position, SHADER_PROGRAM;
  
    var _color;
    var _offset;
  
    var refresh_fragmentShader = function() {
      var shader_fragment = GL.createShader(GL.FRAGMENT_SHADER);
      GL.shaderSource(shader_fragment, shader_fragment_textarea.value);
      GL.compileShader(shader_fragment);
      if (GL.getShaderParameter(shader_fragment, GL.COMPILE_STATUS)) {
        SHADER_PROGRAM = GL.createProgram();
  
        GL.attachShader(SHADER_PROGRAM, shader_vertex);
        GL.attachShader(SHADER_PROGRAM, shader_fragment);
  
        GL.linkProgram(SHADER_PROGRAM);
  
        _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
        _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
        _offset = GL.getAttribLocation(SHADER_PROGRAM, "offset");
  
        GL.enableVertexAttribArray(_color);
        GL.enableVertexAttribArray(_position);
  
        GL.useProgram(SHADER_PROGRAM);
      }
    };
    refresh_fragmentShader();
  
    shader_fragment_textarea.onkeyup=refresh_fragmentShader;
  
  
  
    /*========================= THE TRIANGLE ========================= */
    var vertices = [
      -0.5, -0.5,
      0.5, -0.5,
      0.5, 0.5,
      -0.5, 0.5
    ];
    var size_vertices = vertices.length * 4;
    var colors = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
      0, 1, 0
    ];
    var size_colors = colors.length * 4;
    var offsets = [
      -0.3, -0.3,
      0.3, 0.3
    ];
    var size_offsets = offsets.length * 4;
    var indices = [0,1,2, 0,2,3];
    
    /** 创建VAO & VBO */
    var VAO = GL.createVertexArray();
    GL.bindVertexArray(VAO);
    var VBO = GL.createBuffer ();
    GL.bindBuffer(GL.ARRAY_BUFFER, VBO);
    
    /** 绑定VAO数据 */
    GL.bufferData(GL.ARRAY_BUFFER, size_vertices + size_colors + size_offsets, GL.STATIC_DRAW);
    GL.bufferSubData(GL.ARRAY_BUFFER, 0, new Float32Array(vertices));
    GL.bufferSubData(GL.ARRAY_BUFFER, size_vertices, new Float32Array(colors));
    GL.bufferSubData(GL.ARRAY_BUFFER, size_vertices + size_colors, new Float32Array(offsets));
    
    /** 设置VAO偏移量 */
    GL.enableVertexAttribArray(0);
    GL.vertexAttribPointer(0, 2, GL.FLOAT, false, 4*2, 0);
    GL.enableVertexAttribArray(1);
    GL.vertexAttribPointer(1, 3, GL.FLOAT, false, 4*3, size_vertices);
    GL.enableVertexAttribArray(2);
    GL.vertexAttribPointer(2, 2, GL.FLOAT, false, 4*2, size_vertices + size_colors);
    
    /** 设置增量属性 */
    GL.vertexAttribDivisor(1, 1);
    GL.vertexAttribDivisor(2, 1);
  
    var IBO = GL.createBuffer ();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, IBO);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GL.STATIC_DRAW);
    
    GL.bindVertexArray(null);
    GL.bindBuffer(GL.ARRAY_BUFFER, null);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
  
  
    /*========================= DRAWING ========================= */
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
  
    var animate = function() {
      GL.viewport(0, 0, CANVAS.width, CANVAS.height);
      GL.clear(GL.COLOR_BUFFER_BIT);
      
      GL.bindVertexArray(VAO);
      GL.drawElementsInstanced (GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0, 2);
      GL.bindVertexArray(null);
      
      GL.flush();
      window.requestAnimationFrame(animate);
    };
  
    animate();
  }
  
  window.addEventListener('load', main);