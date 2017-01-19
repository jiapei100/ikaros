var threescene = null;

function Ikaros3D(p)
{
    this.id_module = p.id_module;
    this.id_location = p.id_location;
    
    //this.cam_type = (p.cam_type ? p.cam_type : 0);
    p.opaque = "no";
    
    this.obj = 	new WebUICanvas(this, p, "webgl");
    
    usesData(this.module, this.source);
    usesData(this.id_module, this.id_location);

    this.top = p.x;
    this.left = p.y;
    
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
    
    var container, stats;
    var camera, cameraTarget, scene, renderer;
    
    var ik_objects = [];
    var that = this;

    var models_loaded = false;
    init();
    animate();

    function init() 
    {
        container = document.createElement( 'div' );
        document.body.appendChild( container );

        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera( 85, this.width/this.height, 0.1, 100 );
        camera.position.set( 3, 0.15, 3 );
        cameraTarget = new THREE.Vector3( 0, -0.25, 0 );

        // Fog
        scene.fog = new THREE.Fog( 0x72645b, 2, 15 );
        
        // Axis
        //var axisHelper = new THREE.AxisHelper( 5 );
        //scene.add( axisHelper );


        // Ground
        var plane = new THREE.Mesh(
                                   new THREE.PlaneBufferGeometry( 40, 40 ),
                                   new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
                                   );
        plane.rotation.x = -Math.PI/2;
        plane.position.y = 0;
        scene.add( plane ); 
        plane.receiveShadow = true;
        
        // Lights
        scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
        addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
        addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );
        
        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, clearColor: 0x335588, canvas: that.canvas} ); 
        renderer.setClearColor( scene.fog.color );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize(this.width, this.height);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.cullFace = THREE.CullFaceBack;

        // stats
        
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = that.top+20;
        stats.domElement.style.left = that.left+20;
        container.appendChild( stats.domElement );
        
        
        controls = new THREE.TrackballControls( camera );
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;
				controls.noZoom = false;
				controls.noPan = false;
				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;
				controls.keys = [ 65, 83, 68 ];
				controls.addEventListener( 'change', render );

		//
		window.addEventListener( 'resize', onWindowResize, false );
    }
    function addShadowedLight( x, y, z, color, intensity ) {
        
        var directionalLight = new THREE.DirectionalLight( color, intensity );
        directionalLight.position.set( x, y, z );
        scene.add( directionalLight );
        
        directionalLight.castShadow = true;
        
        var d = 1;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;
        
        directionalLight.shadowCameraNear = 1;
        directionalLight.shadowCameraFar = 4;
        
        directionalLight.shadowMapWidth = 1024;
        directionalLight.shadowMapHeight = 1024;
        
        directionalLight.shadowBias = -0.005;
    }
    
    function onWindowResize() {
        camera.aspect = that.width  / that.height;
        camera.updateProjectionMatrix();
        renderer.setSize( that.width, that.height);
		controls.handleResize();
		render();
    }
   
    function animate() {
        requestAnimationFrame( animate ); 
        stats.update();
		controls.update();
        render();
    }
    
    function render() {
        camera.lookAt( cameraTarget ); 
        renderer.render( scene, camera );
    }

    function LoadSTL(id,m){
        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) 
        {
            //console.log(" Progress" , item, loaded, total );

        };
        manager.onLoad = function ( item, loaded, total ) 
        {
            console.log("Everything is loaded");
        };
            manager.onError = function ( item, loaded, total ) 
        {
            console.log(" Error" , item, loaded, total );
        };

        var callback = function ( geometry ) 
        { 
            //console.log("Callback: Loading nr " + LoadModels + " ID: " +id[0][LoadModels]);
            //console.log("Callback: Loading" + '/Classes/Models/stl/' + id[0][LoadModels] + '.stl');
            if (geometry.hasColors) 
            {
                //console.log("COLOR STL");				
	            material = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
            }
            else
            {
                var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );  
            } 
            obj = new THREE.Mesh( geometry, material );
            // Array
            //obj.matrix.set(m[0][0+(i*16)], m[0][1+(i*16)], m[0][2+(i*16)], m[0][3+(i*16)], m[0][4+(i*16)], m[0][5+(i*16)], m[0][6+(i*16)], m[0][7+(i*16)], m[0][8+(i*16)], m[0][9+(i*16)], m[0][10+(i*16)], m[0][11+(i*16)], m[0][12+(i*16)], m[0][13+(i*16)], m[0][14+(i*16)], m[0][15+(i*16)]);
            //obj.matrix.set(m[i][0], m[i][1], m[i][2], m[i][3], m[i][4], m[i][5], m[i][6], m[i][7], m[i][8], m[i][9], m[i][10], m[i][11], m[0][12], m[i][13], m[i][14], m[i][15]);
            obj.castShadow = true;
            obj.receiveShadow = true;
            ik_objects[LoadModels] = obj;
            scene.add(obj);
            LoadModels++;

            if (LoadModels < id[0].length)  // put the next load in the callback
                loader.load('/Classes/Models/stl/' + id[0][LoadModels] + '.stl', callback ) ;
        };

        LoadModels = 0;
        var loader = new THREE.STLLoader(manager);
        loader.load('/Classes/Models/stl/' + id[0][i] + '.stl', callback) 
    }

    function IkaorsToThreeBase(m)
    {
        var r1 = new THREE.Matrix4();
        r1.makeRotationY(-Math.PI/2); 
        var r2 = new THREE.Matrix4();
        r2.makeRotationZ(-Math.PI/2);           
        var r = new THREE.Matrix4();  
        var ret = new THREE.Matrix4();  
        r.multiplyMatrices( r2, r1);
        ret.multiplyMatrices( r, m);
        return ret
    }

    this.Update = function (data) 
    {
        var m = data[this.module];
        if(!m) return;
        m = m[this.source]
        if(!m) return;
    
        var id = data[this.id_module];
        if(!id) return;
        id = id[this.id_location]
        if(!id) return;
        
        if (!models_loaded)
        {
            //console.log("Load");
            // Load STL
            LoadSTL(id,m)
            //console.log("Done");
            models_loaded = true;
        }
        // Update position from an array 16xid
        for (i = 0; i < id[0].length; i++)
        {
            ik_objects[i].matrixAutoUpdate = false;
            ik_objects[i].matrix.set(m[i][0], m[i][1], m[i][2], m[i][3], m[i][4], m[i][5], m[i][6], m[i][7], m[i][8], m[i][9], m[i][10], m[i][11], m[0][12], m[i][13], m[i][14], m[i][15]);
            ik_objects[i].matrix = IkaorsToThreeBase(ik_objects[i].matrix); 
        }
    }
}