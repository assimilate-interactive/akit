(function () {
  'use strict';

  class AKIT_SceneCameraSimple {
    constructor(arg1, arg2, arg3, arg4) {
      //AKIT_SceneCameraSimple,
      this.SCREEN_WIDTH = window.innerWidth;
      this.SCREEN_HEIGHT = window.innerHeight;
      this.VIEW_ANGLE = arg1;
      this.ASPECT = arg2;
      this.NEAR = arg3;
      this.FAR = arg4;
      this.camera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);
      this.name = APP.cameraName;
      this.position = APP.cameraPosition; // this.rotation
    }

    init() {}

    setPosition(pos) {
      this.camera.position.x = pos.x;
      this.camera.position.y = pos.y;
      this.camera.position.z = pos.z; // console.log(pos)
    }

    cycle() {
      this.pan();
    }

    pan() {} //   this.camera.rotation.set(0.7,0,0);

    /* var time = performance.now();
      var delta = ( time - prevTime ) / 1000;
        //reset z velocity to be 0 always. But override it if user presses up or w. See next line...
      velocity.z -= velocity.z * 10.0 * delta;
      //if the user pressed 'up' or 'w', set velocity.z to a value > 0.
      if ( moveForward ) velocity.z -= 400.0 * delta;
        //pass velocity as an argument to translateZ and call it on camera.
      camera.translateZ( velocity.z * delta );*/


  }

  class AKIT_SceneLight {
    constructor() {}

    init() {
      this.ambientBasic();
      this.sceneOne();
    }

    ambientBasic() {
      AKIT.scene.scene.add(new THREE.AmbientLight(0xffffff));
    }

    directionalShadow(lx, ly, lz, color, cameraDistance, cameraFar, shadowW, shadowH) {
      const light = new THREE.DirectionalLight(color, 1.75);
      light.position.set(lx, ly, lz); //light.position.multiplyScalar( 1.3 );

      light.castShadow = true;
      light.shadow.mapSize.width = shadowW;
      light.shadow.mapSize.height = shadowH;
      light.shadow.camera.left = -cameraDistance;
      light.shadow.camera.right = cameraDistance;
      light.shadow.camera.top = cameraDistance;
      light.shadow.camera.bottom = -cameraDistance;
      light.shadow.camera.far = cameraFar;
      AKIT.scene.scene.add(light);
    }

    sceneOne() {
      var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
      keyLight.position.set(-100, 0, 100);
      var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
      fillLight.position.set(100, 0, 100);
      var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
      backLight.position.set(100, 0, -100).normalize();
      AKIT.scene.scene.add(keyLight);
      AKIT.scene.scene.add(fillLight);
      AKIT.scene.scene.add(backLight);
    }

  }

  class AKIT_Scene {
    constructor(options) {
      this.SCREEN_WIDTH = window.innerWidth;
      this.SCREEN_HEIGHT = window.innerHeight;
      this.VIEW_ANGLE = APP.cameraDistanceViewAngle;
      this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
      this.NEAR = APP.cameraDistanceNear;
      this.FAR = APP.cameraDistanceFar;
      this.RSIZE = 1; //1 / half=2

      this.sceneType = APP.sceneType;
      this.windowLoaded = false;
      if (AKIT.canvas == undefined || AKIT.canvas == 0) AKIT.canvas = document.createElement('canvas'); // AKIT.canvas.height=480;
      // AKIT.canvas.width=640;
      ///////////////////////////////////////////////////////////

      this.scene = new THREE.Scene(); //  this.scene.background = new THREE.Color( 0x505050 );

      this.effects = {};
      this.options = options;
      if (APP.displayStats) this.stats = new Stats();
      window.addEventListener('resize', this.onWindowResize, false);
      window.addEventListener('load', this.onWindowLoad, false);
    }

    init() {
      //////////////////////////////////////////////////////
      this.initCamera();

      if (this.setStats) {
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 100;
        AKIT.container.appendChild(this.stats.domElement);
      }

      this.initLight();
      this.renderer();
      this.window();
    }

    renderer() {
      let renderOptions = APP.rendererOptions;
      renderOptions['canvas'] = AKIT.canvas; // console.log(renderOptions)

      APP.renderer = new THREE.WebGLRenderer(renderOptions);
      APP.renderer.setPixelRatio(window.devicePixelRatio); //APP.renderer.setSize( window.innerWidth, window.innerHeight );
      //  APP.renderer.gammaFactor = 2.2;

      APP.renderer.gammaOutput = true;
    }

    reset() {
      this.scene = new THREE.Scene();
      this.light.init();
    }

    setSceneProperties() {//standard
    }

    setVR() {
      APP.renderer.vr.enabled = true; //  AKIT.container.appendChild(APP.renderer.domElement);
      //   document.body.appendChild( WEBVR.createButton( APP.renderer ) );
      //   window.addEventListener( 'vrdisplaypointerrestricted', onPointerRestricted, false );
      // window.addEventListener( 'vrdisplaypointerunrestricted', onPointerUnrestricted, false );
    }

    stats() {
      if (this.setStats) this.stats.update();
    }

    render() {
      APP.renderer.render(this.scene, this.camera);
    }

    inworld(mesh) {
      if (this.scene.children.indexOf(mesh) == -1) return false;
      return true;
    }

    window() {
      this.SCREEN_WIDTH = AKIT.windowWidth;
      this.SCREEN_HEIGHT = AKIT.windowHeight;
      this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
      APP.renderer.setSize(this.SCREEN_WIDTH / this.RSIZE, this.SCREEN_HEIGHT / this.RSIZE);
      this.camera.aspect = this.ASPECT;
      this.camera.updateProjectionMatrix();
      if (AKIT.control != undefined) AKIT.control.resize();
      AKIT.alogKit(' (sys-resize-window) ' + this.SCREEN_WIDTH + ' ' + this.SCREEN_HEIGHT); //  }
    }

    windowSet(w, h) {
      this.SCREEN_WIDTH = w;
      this.SCREEN_HEIGHT = h;
      this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
      APP.renderer.setSize(this.SCREEN_WIDTH / this.RSIZE, this.SCREEN_HEIGHT / this.RSIZE);
      this.camera.aspect = this.ASPECT;
      this.camera.updateProjectionMatrix();
      if (AKIT.control != undefined) AKIT.control.resize();
      AKIT.alogKit(' (sys-resize) ' + this.SCREEN_WIDTH + ' ' + this.SCREEN_HEIGHT); //  }
    }

    initLight() {
      this.light = new AKIT_SceneLight();
      this.light.init();
    } ///////////////////////////////////////////////////camera


    initCamera() {
      if (this.sceneType == undefined || this.sceneType == 'standard') this.sceneCamera = new AKIT_SceneCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);else if (this.sceneType == 'simple' || this.sceneType == 'vr') this.sceneCamera = new AKIT_SceneCameraSimple(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);else if (this.sceneType == 'peppers') this.sceneCamera = new AKIT_SceneCameraPeppersGhost(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);
      this.camera = this.sceneCamera.camera;
      this.listener = this.sceneCamera.listener;
      this.startCamera();
      this.sceneCamera.init();
    }

    startCamera() {
      if (this.sceneType == undefined || this.sceneType == 'standard' || this.sceneType == 'simple') {
        this.scene.add(this.camera);
        this.camera.position.set(APP.cameraPositionX, APP.cameraPositionY, APP.cameraPositionZ);
        this.camera.lookAt(this.scene.position);
      } else if (this.sceneType == 'vr') {
        this.scene.add(this.camera);
        this.camera.position.set(APP.cameraPositionX, APP.cameraPositionY, APP.cameraPositionZ);
      } else if (this.sceneType == 'peppers') {
        this.sceneCamera.start(this.SCREEN_WIDTH, this.SCREEN_HEIGHT, APP.cameraDistance);
      }
    }

    resetCamera() {
      if (this.sceneType == undefined || this.sceneType == 'standard' || this.sceneType == 'simple') {
        //  this.scene.add(this.camera);
        this.camera.position.set(APP.cameraPositionX, APP.cameraPositionY, APP.cameraPositionZ);
        this.camera.lookAt(this.scene.position); //   console.log(this.scene, this.camera);
      } else if (this.sceneType == 'vr') {
        //  this.scene.add(this.camera);
        this.camera.position.set(APP.cameraPositionX, APP.cameraPositionY, APP.cameraPositionZ);
      } else if (this.sceneType == 'peppers') {
        this.sceneCamera.start(this.SCREEN_WIDTH, this.SCREEN_HEIGHT, APP.cameraDistance);
      }
    }

    cameraSet(name) {
      this.sceneCamera.transition(name);
    } //////////////////////////////////////////////////////////////////////////////////////////////////


    fullScreen() {//  AKIT.alogKit(' (sys-fullscreen) ' + screenfull.enabled);
      //   if (screenfull.enabled) screenfull.request();
    }

    fullScreenExit() {//    if (screenfull.enabled) screenfull.exit();
    }

    onWindowResize(e) {
      APP.run.resize();
      AKIT.scene.window();
    }

    onWindowLoad(e) {
      this.windowLoaded = true;
    }

  }

  window.oncontextmenu = function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };

  class AKIT_SceneBasic {
    constructor(options) {
      this.SCREEN_WIDTH = window.innerWidth;
      this.SCREEN_HEIGHT = window.innerHeight;
      this.VIEW_ANGLE = APP.cameraDistanceViewAngle;
      this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
      this.NEAR = APP.cameraDistanceNear;
      this.FAR = APP.cameraDistanceFar;
      this.RSIZE = 1; //1 / half=2

      this.sceneType = APP.sceneType;
      this.windowLoaded = false;

      if (AKIT.canvas == undefined || AKIT.canvas == 0) {
        AKIT.canvas = document.createElement('canvas'); //  AKIT.canvas.height=240;
        //  AKIT.canvas.width=240;
        //  console.log(AKIT.canvas,this.SCREEN_HEIGHT,this.SCREEN_WIDTH);
      }

      this.scene = new THREE.Scene(); //  console.log(this.scene)
      //  this.scene.background = new THREE.Color( 0x505050 );

      this.effects = {};
      this.options = options;
      if (APP.displayStats) this.stats = new Stats(); //    window.addEventListener('resize', this.onWindowResize, false);
      //    window.addEventListener('load', this.onWindowLoad, false);
    }

    init() {
      if (this.setStats) {
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 100;
        AKIT.container.appendChild(this.stats.domElement);
      }

      this.initLight(); //  this.renderer();

      this.window();
    }

    cameraSet(camera) {
      this.camera = camera;
      /*  this.sceneCamera = new AKIT_SceneCameraSimple(
          this.VIEW_ANGLE,
          this.ASPECT,
          this.NEAR,
          this.FAR
        );
        this.camera = this.sceneCamera.camera;*/
    }

    renderer(rendererConfig) {
      let rendererOptions = rendererConfig; //APP.rendererOptions;

      rendererOptions.antialias = true;
      APP.renderer = new THREE.WebGLRenderer(rendererOptions);
      return APP.renderer;
    }

    reset() {
      this.scene = new THREE.Scene();
      this.light.init();
    } //setVR() {
    //  APP.renderer.vr.enabled = true;
    //  }


    stats() {
      if (this.setStats) this.stats.update();
    }

    render() {
      APP.renderer.render(this.scene, this.camera);
    }

    inworld(mesh) {
      if (this.scene.children.indexOf(mesh) == -1) return false;
      return true;
    }

    window() {
      this.SCREEN_WIDTH = AKIT.windowWidth;
      this.SCREEN_HEIGHT = AKIT.windowHeight;
      this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
      if (AKIT.control != undefined) AKIT.control.resize();
      AKIT.alogKit(' (sys-resize-window) ' + this.SCREEN_WIDTH + ' ' + this.SCREEN_HEIGHT); //  }
    }

    initLight() {
      this.light = new AKIT_SceneLight();
      this.light.init();
    }

    onWindowResize(e) {
      APP.run.resize();
      AKIT.scene.window();
    }

    onWindowLoad(e) {
      this.windowLoaded = true;
    }

  }

  ///// AKIT - application toolkit (assimilate interactive three.js toolkit)
  class AKIT_Global {
    constructor() {
      AKIT = {}; //////////////////////////////////////////////////globals

      AKIT.system = 0;
      AKIT.scene = 0;
      AKIT.canvas = 0;
      AKIT.renderer = 0;
      AKIT.objectIDCount = 0;
      AKIT.container = 0;
      AKIT.workerTimeDelay = [];
      AKIT.clock = new THREE.Clock();
      AKIT.InteractionModes = {
        MOUSE: 1,
        TOUCH: 2,
        VR_0DOF: 3,
        VR_3DOF: 4,
        VR_6DOF: 5
      };
      AKIT.InteractionMode = 2; /// -1 = get gamepads  - otherwise override    MOUSE: 1,TOUCH: 2,  VR_0DOF: 3,VR_3DOF: 4,VR_6DOF: 5

      AKIT.running = false;
      AKIT.ready = false;
      AKIT.windowHeight = window.innerHeight;
      AKIT.windowWidth = window.innerWidth;
      AKIT.loadedAR = false; //////////////////////////////////////////////////scene

      AKIT.getSceneObject = function () {
        /*  var hasaframe;
            try {
                hasaframe = AFRAME;
          } catch (e) {
            if (e instanceof ReferenceError) {
              }
          }*/
        if (APP.system == 'aframe') return new AKIT_SceneBasic();else return new AKIT_Scene();
      }; //////////////////////////////////////////////////test


      AKIT.akitTest = function () {}; //////////////////////////////////////////////////store


      AKIT.initobjectStore = function () {
        if (AKIT.objectStore != undefined) {
          AKIT.objectStore = new AKIT_ObjectStore();
        }
      };

      Array.prototype.store = function (from) {
        const obj = this[from];
        obj.store();
        const rest = this.slice(from + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
      }; ///////////////////////////////////////////////////////////////array


      Array.prototype.remove = function (from, to) {
        const rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
      }; ///////////////////////////////////////////////////////////////rand


      AKIT.getRand = function () {
        return _.random(0, 100000);
      }; ///////////////////////////////////////////////////////////////RGB


      AKIT.getValueRGBAString = function (rf, gf, bf, af) {
        return AKIT.getRGBAString(Math.round(rf * 255), Math.round(gf * 255), Math.round(bf * 255), af);
      };

      AKIT.getRGBAString = function (r, g, b, a) {
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      }; ///////////////////////////////////////////////////////string


      AKIT.objToString = function (obj) {
        let str = '';

        for (const p in obj) {
          if (obj.hasOwnProperty(p)) {
            str += p + ',';
          }
        }

        return str;
      }; ///////////////////////////////////////////////////////trig


      AKIT.getAngleDeg = function (x1, y1) {
        let deg = Math.atan2(y1, x1) * pi_half;
        return deg;
      };

      AKIT.setDefaultImage = function () {
        AKIT.defaultImage = new Image();
      }; /////////////////////////////////////////////////////logging


      AKIT.akitError = function (e) {
        console.log('ERROR: ' + e);
      };

      AKIT.alogApp = function (m) {
        console.log('APP:' + m);
      };

      AKIT.alogAppP = function (m) {
        console.log('APP:' + m);
      };

      AKIT.alogAppA = function (m) {
        console.log('AR-APP:' + m);
      };

      AKIT.alogKit = function (m) {
        console.log('KIT: ' + m);
      };

      AKIT.alogKitP = function (m) {//console.log('KIT: ' + m);
      };

      AKIT.alogKitCtl = function (m) {
        console.log('CTL: ' + m);
      };

      AKIT.alogKitCtl2 = function (m) {// console.log('CTL2: ' + m);
      };

      AKIT.akitError = function (e, p) {
        console.log('ERROR: ' + ' ' + e + ' ' + JSON.stringify(p));
      };

      AKIT.alogApp = function (m) {
        console.log('APP:' + m);
      };

      AKIT.alogAppP = function (m) {
        console.log('APP:' + m);
      };

      AKIT.alogApp3 = function (m) {// console.log("APP3:"+m);
      };

      AKIT.alogApp2 = function (m) {//   console.log("APP2:"+m);
      };

      AKIT.alogFrame = function (m) {//   console.log("APP:"+m);
      };

      AKIT.alogAppObj = function (m) {//  console.log("APP-Obj:"+m);
      };

      AKIT.alogAppCycle = function (m) {//console.log("APP-CYC:"+m);
      };

      AKIT.alogAppObj2Cycle = function (m) {//console.log("APP-CYC:"+m);
      };

      AKIT.aloggerApp = function (obj, m) {//if (obj!="")
        //  console.log("APP: "+m);
        //if (obj=="event")
        //if (obj=="node-sys")
        //  console.log("APP: ("+obj+") "+m);
      };

      AKIT.aloggerEvent = function (m) {///console.log("APP_EVENT: "+m);
      };

      AKIT.alogDB = function (m) {
        console.log('DEBUG: ' + m);
      };

      AKIT.alogPreload = function (m) {
        console.log('PRELOAD: ' + m);
      };

      AKIT.aloggerKit = function (m) {//   console.log("KIT: "+m);
      };

      AKIT.aloggerKitURL = function (m) {//  console.log('URL: ' + m);
      };

      AKIT.aloggerKitP = function (m) {//  console.log("PHYS: "+m);
      };

      AKIT.aloggerKitS = function (m) {//  console.log("SYS: "+m);
      };

      AKIT.aloggerKitV = function (m) {// console.log('VID: ' + m);
      };

      AKIT.aloggerCtlKit = function (m) {//console.log("CTL: "+m);
      };

      AKIT.aloggerCtlKit2 = function (m) {//  console.log("CTL: "+m);
      };

      AKIT.aloggerKitPW = function (m) {//console.log("PHYW: "+m);
      };
    }

  }

  class APP_Properties {
    constructor() {
      /////////////////////////////////////////// app config
      APP = {
        ///////////////////////////////////////////////////////////basic
        platformAR: 'arjs',
        /// webxr, arjs,web3ar,8wall
        language: 'en',
        //cn
        system: 'aframe',
        /// js,aframe,ng
        ///////////////////////////////////////////////////////////dir
        ////////////////////////////////////////////////// production settings
        protocolProduction: window.location.protocol,
        hostProduction: window.location.hostname,
        portProduction: window.location.port,
        objDirProduction: 'assets/objects/',
        markerDirProduction: 'assets/marker/',
        ////////////////////////////////////////////////// default development settings
        protocolDevelopment: window.location.protocol,
        hostDevelopment: window.location.hostname,
        portDevelopment: window.location.port,
        objDirDevelopment: 'assets/model/',
        markerDirDevelopment: 'assets/marker/',
        //  rendererOptions: {
        //  canvas: AKIT.canvas,
        //    antialias: true,
        //    alpha: true
        //   precision: 'mediump'
        //  },

        /*  sceneOptions: {
            worldSize: 10,
             background3D: new THREE.Color('black'),
             grid: true,
             scenevr: ''
          },*/
        ///////////////////////////////////////////deug
        debug: {
          devices: {}
        },
        ////////////////////////////////////////////////////
        pages: {
          wechat: '/info'
        },
        //////////////////////////////////////media
        video: {
          width: 8,
          height: 8,
          imageWidth: 320,
          imageHeight: 240
        },
        mediaDevices: {
          parameters: {
            ///devices general
            sourceType: 'webcam',
            sourceUrl: null,
            deviceId: null,
            sourceWidth: 480,
            //480   ///  SETTING FOR resize issue
            sourceHeight: 640,
            //640,
            displayWidth: 640,
            displayHeight: 480 //640

          },
          parameters2: {
            ///desktop, ios11
            sourceType: 'webcam',
            sourceUrl: null,
            deviceId: null,
            sourceWidth: 640,
            //480   ///  SETTING FOR resize issue
            sourceHeight: 480,
            //640,
            displayWidth: 640,
            displayHeight: 480 //640

          }
        },
        //////////////////////////////////////////////////platforms
        arjs: {
          markerDistance: 1000,
          cameraParametersUrl: '/assets/platform/arjs/camera_para.dat',
          patternUrl: APP.markerDirectory,
          // handle default parameters
          parameters: {}
        },
        webxr: {},
        '8wall': {},
        ///////////////////////////////////////////////////////////app
        carouselRadius: 100,
        controlRadius: 5,
        itemProperties: {
          widthD: 45,
          heightD: 60,
          width: 6,
          height: 6
        }
      }; /////////////////////////////////////////////  AR objects
      ////////////// "location": "file" "url"
      ////////////// "filetype": "obj" "usd"
      // id: string;
      // description: string;
      //  url: string;
      //  product: {'brand': string, 'dimensions': {}, 'type': string, 'image': string };
      /////////////////////////////////////////////////////////////////////MARKERS
      /// objectPerMarker - each marker has 1 object
      /// objectSelect = each marker has 1 select object

      var markerScheme = 'objectPerMarker';
      APP.markers = [//  { name: '1', marker: 'pattern-marker.patt', scheme: markerScheme },
      //   { name: '2', marker: 'pattern-marker.patt', scheme: markerScheme },
      {
        name: '1',
        marker: 'pattern-marker.patt',
        scheme: markerScheme
      }];
      APP.properties = {
        video: {
          scale: 0.15,
          rotate: {
            x: -0.5,
            y: 0,
            z: 0
          },
          ui: 'rotate',
          extension: 'mp4',
          url: '/',
          location: 'file',
          loader: 'spinner' //  control: true

        },
        obj: {
          scale: 0.15,
          rotate: {
            x: 0,
            y: -0.6,
            z: 0
          },
          ui: 'rotate',
          url: '/',
          location: 'file',
          loader: 'spinner'
        },
        gltf: {
          scale: 0.5,
          rotate: {
            x: 0,
            y: 0,
            z: 0
          },
          ui: 'rotate',
          url: '/',
          location: 'file',
          loader: 'spinner'
        }
      }; ///////////////////////////////////////////////////////

      APP.preload = {//    ARTypePlaneVideoEffectVignette: {
        //      number: 3,
        //      args: [APP.video.width, APP.video.height, APP.video.imageWidth, APP.video.imageHeight, '', '', false]
        //    }
      }; /////////////////////////////////////////////////////////////

      const PRESETS = {
        //////////////////////////debug values
        app: {
          app: {
            system: 'local',
            scene: 'simple' // peppers, vr, standard,simple

          },
          camera: {
            cameraDistanceFar: 10000,
            cameraDistanceNear: 0.1,
            cameraDistanceViewAngle: 45,
            cameraPositionX: 0,
            cameraPositionY: 0,
            cameraPositionZ: 0,
            cameraTargetX: 0,
            cameraTargetY: 0,
            cameraTargetZ: 0
          }
        }
      }; //////////////////////////////////////////////////////////////////////APP

      AKIT.loaded = false;
      APP.directory = 0;
      APP.renderer = 0;
      APP.displayStats = false;
      APP.currentPreset = PRESETS['app']; /// test scene (smaller values)
      //////////////////////////////////////////////////////camera

      APP.sceneType = APP.currentPreset.app.scene;
      APP.cameraDistanceFar = APP.currentPreset.camera.cameraDistanceFar;
      APP.cameraDistanceNear = APP.currentPreset.camera.cameraDistanceNear;
      APP.cameraDistanceViewAngle = APP.currentPreset.camera.cameraDistanceViewAngle;
      APP.cameraPositionX = APP.currentPreset.camera.cameraPositionX;
      APP.cameraPositionY = APP.currentPreset.camera.cameraPositionY;
      APP.cameraPositionZ = APP.currentPreset.camera.cameraPositionZ;
      APP.cameraName = 'camera1';
      APP.hostname = window.document.hostname;
    }

  }

  ///// AKIT - application toolkit (assimilate interactive three.js toolkit)
  class AKIT_AppAFrame {
    constructor() {
      this.properties = new APP_Properties();
      this.global = new AKIT_Global();
      console.log('akit - (properties):', APP, AKIT);
    }

    init() {
      this.platform();
      this.asset();
      this.anchor();
    }

    set() {}

    platform() {
      AFRAME.registerSystem('akit', {
        schema: {//		arg : {
          //  			type: 'string',
          //  			default: 'arg1',
          //  		}
        },
        init: function () {


          console.log('akit-platform-init:');
          akit.start();
        },
        tick: function () {
          //    console.log('akit-platform-tick')
          akit.cycle();
        }
      });
    }

    anchor() {
      AFRAME.registerPrimitive('a-anchor', AFRAME.utils.extendDeep({}, AFRAME.primitives.getMeshMixin(), {
        defaultComponents: {
          'akit-anchor': {}
        },
        mappings: {
          'name': 'akit-anchor.name',
          'group': 'akit-anchor.group',
          'marker': 'akit-anchor.marker'
        }
      }));
    }

    asset() {
      AFRAME.registerComponent('akit-anchor', {
        schema: {
          name: {
            type: 'string'
          },
          group: {
            type: 'string'
          },
          marker: {
            type: 'string'
          }
        },
        init: function () {
          var data = this.data;
          var el = this.el;
          var objent = el.getChildEntities();
          var obj = new THREE.Group();

          for (var i = 0; i < objent.length; i++) {
            var child = objent[i];
            obj.children.push(child.object3D);
          }

          window.akit.objectAnchor(this.data.name, this.data.group, this.data.marker, obj);
        }
      });
    }
    /*
      asset() {
    
      //   console.log('akit-anchor-load');
    
          AFRAME.registerComponent('a-anchor', {
          	schema: {
          		platform : {
          			type: 'string',
          			default: '',
          		}
            },
    
            init: function () {
                var _this = this
    
    
                console.log('akit-anchor-init');
    
                //startAR
    
            },
    
            update: function () {
            },
    
            tick: function(){
    
                console.log('akit-anchor-tick')
            }
    
          });
    
      }
    
    
      scene() {
    
        var sceneComponent = AFRAME.components['a-scene'];
          //  lookControlsComponent = lookControls.Component;
        console.log(sceneComponent)
    
      }
    
      scene1() {
        //  this.scene = document.querySelector('a-scene').object3D;  // THREE.Scene
        //  console.log(this.scene)
    
        AFRAME.registerComponent('do-something', {
          init: function () {
            var sceneEl = this.el;
            var test = document.querySelector('a-scene').object3D;
            console.log(sceneEl,test);
          }
        });
    
      }
    
    //    var a_asset_item = AFRAME.components['a-asset-item'],
    //    akit_asset_item = a_asset_item.Component;
      asset3() {
    
          AFRAME.registerComponent('akit-asset-item', {
            schema: {
              src: {type: 'string'}
    
            },
    
            init: function () {
              let trunk = document.createElement('a-asset-item');
    
              console.log('test',trunk,src)
            }
          });
    
        }
    
    
        asset1() {
    
         var a_asset_item = AFRAME.components['a-asset-item']
         console.log(a_asset_item)
    
        AFRAME.registerElement('akit-asset-item', {
          prototype: Object.create(AFRAME.components['a-asset-item'].prototype, {
    
          })
        });
      }
    
      asset2() {
    
        console.log('akit-anchor-load')
    
        AFRAME.registerElement('a-anchor', {
          //  prototype: Object.create(ANode.prototype, {
          //    console.log('akit-anchor-init')
        //    })
        });
    
      }
    */


  }

  class AKIT_AppEnv {
    constructor() {
      this.browser = 'generic';
      this.init();
    }

    init() {
      // console.log(window.navigator.userAgent);
      this.setBrowser();
      this.setHost();
    }

    setBrowser() {
      if (window.navigator.userAgent.indexOf('Firefox') > -1) this.browser = 'firefox';
      if (window.navigator.userAgent.indexOf('Chrome') > -1) this.browser = 'chrome';
      if (window.navigator.userAgent.indexOf('Edge') > -1) this.browser = 'edge';
      return false;
    }

    setHost() {
      if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {
        /// local
        APP.host = APP.protocolDevelopment + '//' + APP.hostDevelopment + ':' + APP.portDevelopment + '/';
        APP.objDir = APP.objDirDevelopment;
        APP.markerDirectory = APP.markerDirDevelopment;
      } else {
        APP.host = APP.protocolProduction + '//' + APP.hostProduction + ':' + APP.portProduction + '/';
        APP.objDir = APP.objDirProduction;
        APP.markerDirectory = APP.markerDirProduction;
      }

      AKIT.alogApp('(directory) host:' + APP.host + ' obj:' + APP.objDir + ' marker:' + APP.markerDirectory);
    }

  }

  class AKIT_Object {
    constructor() {
      //AKIT_Object,
      Object.defineProperty(this, 'id', {
        value: AKIT.objectIDCount++
      });
      this.parent;
      this.properties = {};
      this.properties_id = {};
      this.child = {};
      this.child_id = {}; //this.child_store={};

      this.cache = {};
      this.properties['debug'] = false;
      this.properties['color'] = 0xffffff;
    }

    setType(o, i) {
      this.type = o;
      if (i == undefined) this.ident = o;else this.ident = i;
      this.name = 'uid_' + this.id + '_' + this.ident;
    } ///////////////////////////////////////////////////////


    promise() {} ///////////////////////////////properties


    addProperty(name, prop) {
      AKIT.alogKit('(aobj-property): ' + name + ' ' + prop);
      this.properties[name] = prop;
    }

    addPropertyId(name, prop, id) {
      this.addProperty(name, prop);
      this.properties_id[name] = name + '_' + id;
    }

    getProperty(name) {
      return this.properties[name];
    }

    restoreProperty(name, id, store) {
      if (this.properties_id[name] != undefined) ;
    }

    doesPropertyExist(name, id) {
      if (this.properties_id[name] == name + '_' + id) return true;
    } //this.doesPropertyExist('geometry',id,true))


    setParent(p) {
      this.parent = p;
    }

    addChild(name, prop, id) {
      let idc = this.setChildId(id);
      AKIT.alogKit('(aobj-child): ' + name + ' ' + ' ' + idc);
      this.child[name] = prop;
      if (id != undefined) this.child_id[name] = idc;
    }

    getChild(name) {
      return this.child[name];
    }

    setChild(name, prop, id) {
      let idc = this.setChildId(id);
      this.child[name] = prop;
      this.child_id[name] = idc;
    }

    setChildId(id) {
      return this.type + '_' + id;
    }

    unsetChild(name) {
      this.child[name] = null;
      delete this.child[name];
      this.child_id[name] = null;
      delete this.child_id[name];
    }

    storeChild(name) {
      if (this.storeIfChild(name)) this.unsetChild(name);
    }

    storeIfChild(name) {
      //let oidc = this.setChildId(oid);
      let idc = this.child_id[name];

      if (idc != undefined) {
        //if (idc!=oidc) {
        let c = this.child[name];

        if (c != undefined) {
          AKIT.store.storeObject(idc, c);
          return true;
        } //}

      }

      return false;
    }

    restoreChild(id, name) {
      let idc = this.setChildId(id);
      var c = AKIT.store.restoreObject(idc, name);

      if (c != undefined) {
        return c;
      }
      /*if (this.child_store[id]!=undefined) {
          let c = this.child_store[id];
          this.child_store[id] = null;
          delete this.child_store[id];
        //  this.child[name]=c;
        //  this.child_id[name]=id;
          return c;
        }*/

    } //  addChildId(name, prop,id) {
    //      this.addChild(name,prop);
    //      this.child_id[id] = prop;
    //  }


    caller(p) {
      this.caller = p;
    }

    call(e, obj) {
      if (this.caller != undefined) this.caller.call(e, obj);
    }

  }

  class AKIT_ObjectPropertyVisible extends AKIT_Object {
    constructor(parent) {
      //AKIT_ObjectPropertyVisible,
      super();
      this.parent = parent;
    }

    init(vmin, vmax, time, type) {
      this.properties['min'] = vmin;
      this.properties['max'] = vmax;
      this.properties['start'] = 0;
      this.properties['time'] = time;
      this.properties['fader'] = {};
      this.properties.fader['type'] = type;
      this.initFader(this.properties.start, this.properties.time, type);
    }

    set(v) {
      this.setFader(v);
    }

    fade(v) {
      this.fadeTarget(v);
    }

    none() {
      this.setFader(0);
    }

    low() {
      this.fade(this.properties.min);
    }

    high() {
      this.fade(this.properties.max);
    }

    visible() {
      this.setFader(this.properties.max);
    }

    update() {
      this.updateFader();
    } ///////////////////////////////////////////////////////////////////////////


    initFader(startf, timef, t) {
      this.properties.fader = {};
      this.properties.fader['start'] = startf;
      this.properties.fader['time'] = timef;
      this.properties.fader['value'] = 0;
      this.properties.fader['type'] = t;
      this.properties.fader['target'] = startf;
      this.properties.fader['targeting'] = false;
      this.properties.fader['timeSegment'] = 0;
      this.properties.fader['timeEnd'] = 0;
      /*  if (this.properties.fader.type == 'material')
                this.parent.material.opacity = this.properties.fader.start;
            else if (this.properties.fader.type == 'particleEmitter')
                this.parent.particleSetOpacity(this.properties.fader.start);
            else if (this.properties.fader.type == 'attribute')
                this.parent.attributeSetAlphaCustom(this.properties.fader.start);
              this.properties.fader.value = this.properties.fader.start;*/
    }

    fadeTarget(f) {
      if (this.properties.fader.target != f) {
        this.properties.fader.target = f;
        this.properties.fader.targetStart = this.properties.fader.value;
        let tval = f - this.properties.fader.value;
        this.properties.fader.timeSegment = Math.abs(tval * this.properties.fader.time);
        this.properties.fader.timeEnd = Date.now() + this.properties.fader.timeSegment;
        if (tval < 0) tval = 0;
        if (tval > 1) tval = 1;
        this.properties.fader.targetSeg = Math.abs(tval);
        this.properties.fader.targeting = true;
      }
    }

    setFader(f) {
      if (this.properties.fader.value != f) {
        if (this.properties.fader.type == 'material') {
          this.parent.setOpacity(f);
        } else if (this.properties.fader.type == 'particle') this.parent.particleSetOpacity(f);else if (this.properties.fader.type == 'particleEmitter') this.parent.particleSetOpacity(f);else if (this.properties.fader.type == 'attribute') this.parent.attributeSetAlphaCustom(f);

        this.properties.fader.value = f; //  aloggerCtlKit("setfader:" + this.id + " " + " " + f + " " + this.properties.fader.type);
      }
    }

    updateFader() {
      if (this.properties.fader.targeting == true) {
        if (Date.now() < this.properties.fader.timeEnd) {
          const ttime = 1.0 - (this.properties.fader.timeEnd - Date.now()) / this.properties.fader.timeSegment;
          let tf = this.properties.fader.targetStart + ttime * this.properties.fader.targetSeg;
          if (tf < 0) tf = 0;
          if (tf > 1) tf = 1;
          this.setFader(tf);
        } else {
          this.properties.fader.targeting = false;
          this.properties.fader.value = this.properties.fader.target;
          this.setFader(this.properties.fader.value);
        }
      }
    }

  }

  //import {THREE.Vector3} from 'three';
  class AKIT_Control3DObject {
    constructor() {// this.eventBlock = {}
    }

    init() {
      this.tapTime = 400; //tap

      this.eventStillOverTimeout = 100;
      this.eventStartDownPoint = {};
      this.eventStartDownTime = {};
      this.eventCurrentDownPoint = {};
      this.eventCurrentDownTime = {};
      this.eventStillDownPoint = {};
      this.eventStillDownTime = {};
      this.eventStillOverPoint = {};
      this.eventStillOverTime = {};
      this.eventStillOverDepth = {};
      this.eventStartStillTime = {};
      this.eventStartStillPoint = {};
      this.eventStartStillDownGroup = {};
      this.cacheStillOverDepth = {};
      this.eventControllerOrigin = {};
      this.eventCurrentVelocity = {};
    }

    clearEvent(id) {
      this.eventStartDownPoint[id] = null;
      delete this.eventStartDownPoint[id];
      this.eventCurrentDownPoint[id] = null;
      delete this.eventCurrentDownTime[id];
      this.eventStartDownTime[id] = null;
      delete this.eventStartDownTime[id];
      this.eventStillDownPoint[id] = null;
      delete this.eventStillDownPoint[id];
      this.eventStillDownTime[id] = null;
      delete this.eventStillDownTime[id];
      this.eventStillOverPoint[id] = null;
      delete this.eventStillOverPoint[id];
      this.eventStillOverTime[id] = null;
      delete this.eventStillOverTime[id];
      this.eventStillOverDepth[id] = null;
      delete this.eventStillOverDepth[id];
      this.eventStartStillTime[id] = null;
      delete this.eventStartStillTime[id];
      this.eventStartStillPoint[id] = null;
      delete this.eventStartStillPoint[id];
      this.eventStartStillDownGroup[id] = null;
      delete this.eventStartStillDownGroup[id];
      this.eventCurrentVelocity[id] = null;
      delete this.eventCurrentVelocity[id];
      this.eventControllerOrigin[id] = null;
      delete this.eventControllerOrigin[id];
    } //eventStartStillOverGroup
    //eventStartStillPointGroup
    ///////////////////////////////base events


    startDownEvent(id, grp, opts) {
      if (this.eventStartDownPoint[id] == undefined) this.eventStartDownPoint[id] = new THREE.Vector3(0, 0, 0);
      let pt = this.eventStillOverPoint[id];

      if (pt != undefined) {
        this.eventStartDownTime[id] = Date.now();
        this.eventStartDownPoint[id].x = pt.x;
        this.eventStartDownPoint[id].y = pt.y;
        this.eventStartDownPoint[id].z = pt.z; //alogKitCtl(" (control3DObj-startDownEvent) " + id + " " + grp+ " " +opts);
      }
    }

    stillDownEvent(id, grp, pt, origin) {
      if (this.eventStillDownPoint[id] == undefined) this.eventStillDownPoint[id] = new THREE.Vector3(0, 0, 0);

      if (this.eventStartStillTime[id] != undefined) {
        this.eventStillDownPoint[id].x = this.eventStillOverPoint[id].x;
        this.eventStillDownPoint[id].y = this.eventStillOverPoint[id].y;
        this.eventStillDownPoint[id].z = this.eventStillOverPoint[id].z;
      } else {
        let pt2 = this.getStillDownDepth(id, pt);
        this.eventStillDownPoint[id].x = pt2.x;
        this.eventStillDownPoint[id].y = pt2.y;
        this.eventStillDownPoint[id].z = pt2.z;
      }

      this.setOrigin(id, origin);
      this.stillDownEventGrpAdd(grp, id);
    }

    stillDownEventEnd(id, grp, opts) {
      //      if (this.checkTap(id,opts))
      //           this.parent.eventTap(id);
      this.eventStartDownTime[id] = null;
      delete this.eventStartDownTime[id];
      this.stillDownEventGrpDel(grp, id);
    }

    stillOverEvent(id, grp, data, opts, pt, origin) {
      this.startStillOverEvent(id, grp, pt, opts);
      if (this.eventStillOverPoint[id] == undefined) this.eventStillOverPoint[id] = new THREE.Vector3(0, 0, 0);
      this.eventStillOverPoint[id].x = pt.x;
      this.eventStillOverPoint[id].y = pt.y;
      this.eventStillOverPoint[id].z = pt.z; // this.eventStillOverPoint[id].set(pt);

      this.eventStillOverDepth[id] = pt.length();
      this.eventStillOverTime[id] = Date.now(); //   this.setOrigin(id,origin)
    }

    stillOverEventEnd(id, grp, pt, opts, origin) {
      this.eventStartStillTime[id] = null;
      delete this.eventStartStillTime[id]; //     console.log('stillDownEventEnd',id);
    }

    startStillOverEvent(id, grp, pt, opts) {
      //   console.log('stillDownEventStart',id,this.eventStartStillTime[id],this.eventStillOverTime[id])
      if (this.eventStartStillTime[id] == undefined) {
        this.eventStartStillTime[id] = Date.now();
        if (this.eventStartStillPoint[id] == undefined) this.eventStartStillPoint[id] = new THREE.Vector3(0, 0, 0);
        this.eventStartStillPoint[id].x = pt.x;
        this.eventStartStillPoint[id].y = pt.y;
        this.eventStartStillPoint[id].z = pt.z;
      }
    }

    stillOverEventTimer(id) {
      var etime = Date.now() - this.eventStillOverTime[id];
      if (etime > this.eventStillOverTimeout) return true;
      return false;
    }

    stillDownEventGrpAdd(grp, id) {
      if (this.eventStartStillDownGroup[grp] == undefined) this.eventStartStillDownGroup[grp] = [];

      if (this.eventStartStillDownGroup[grp].indexOf(id) == -1) {
        let egrp = this.eventStartStillDownGroup[grp];
        egrp.push(id);
        this.eventStartStillDownGroup[grp] = egrp;
      }
    }

    stillDownEventGrpDel(grp, id) {
      if (this.eventStartStillDownGroup[grp] == undefined) this.eventStartStillDownGroup[grp] = []; //let group  = this.getOrCreateCached(this.eventStartStillDownGroup, grp, newArray);

      let ii = this.eventStartStillDownGroup[grp].indexOf(id);

      if (ii != -1) {
        this.eventStartStillDownGroup[grp].remove(ii);
      }
    }

    getStillDownTime(id) {
      const dt = Date.now() - this.eventStartDownTime[id];
      return dt;
    }

    getDistanceStillDown(id) {
      let d = this.eventStillDownPoint[id].distanceTo(this.eventStartDownPoint[id]);
      return d;
    } ///////////////////////////////////////////////////////////////////////////gets


    getStillDownDepth(id, pt) {
      if (this.cacheStillOverDepth[id] == undefined) this.cacheStillOverDepth[id] = new THREE.Vector3(0, 0, 0);
      this.cacheStillOverDepth[id].x = pt.x;
      this.cacheStillOverDepth[id].y = pt.y;
      this.cacheStillOverDepth[id].z = pt.z;
      this.cacheStillOverDepth[id].normalize();
      this.cacheStillOverDepth[id].x = this.cacheStillOverDepth[id].x * this.eventStillOverDepth[id];
      this.cacheStillOverDepth[id].y = this.cacheStillOverDepth[id].y * this.eventStillOverDepth[id];
      this.cacheStillOverDepth[id].z = this.cacheStillOverDepth[id].z * this.eventStillOverDepth[id];
      return this.cacheStillOverDepth[id];
    } /////////////////////////////////////////////////////////////////////////////checks


    setOrigin(id, pt) {
      if (this.eventControllerOrigin[id] == undefined) this.eventControllerOrigin[id] = new THREE.Vector3(0, 0, 0);

      if (pt != undefined) {
        this.eventControllerOrigin[id].x = pt.x;
        this.eventControllerOrigin[id].y = pt.y;
        this.eventControllerOrigin[id].z = pt.z;
      } //  console.log('setOrigin',this.eventControllerOrigin[id]);

    }

    setVelocity(id) {
      if (this.eventCurrentDownPoint[id] == undefined) {
        this.eventCurrentDownPoint[id] = new THREE.Vector3(0, 0, 0);
        this.eventCurrentVelocity[id] = 0;
      }

      let t = Date.now();
      const dt = t - this.eventCurrentDownTime[id];
      let dist = this.eventStillDownPoint[id].distanceTo(this.eventCurrentDownPoint[id]); //current

      this.eventCurrentDownPoint[id].x = this.eventStillDownPoint[id].x;
      this.eventCurrentDownPoint[id].y = this.eventStillDownPoint[id].y;
      this.eventCurrentDownPoint[id].z = this.eventStillDownPoint[id].z;
      this.eventCurrentDownTime[id] = t;
      this.eventCurrentVelocity[id] = dist / dt;
    }

    checkFocusDown(id, timeout, range) {
      //down and halt
      // console.log(this.getStillDownTime(id),this.eventCurrentVelocity[id]);
      if (this.eventCurrentVelocity[id] < range) {
        if (this.getStillDownTime(id) > timeout) return true;else return false;
      }

      this.eventStartDownTime[id] = Date.now();
      return false;
    }

    resetFocusDown(id) {
      this.eventStartDownTime[id] = Date.now();
    }

    checkDown(id) {
      if (this.eventStartStillTime[id] != null) return true;
      return false;
    }

    checkTap(id, opts) {
      if (opts.tap) {
        if (this.checkTapTime(id)) {
          if (this.parent.eventTapCheck(id)) return true;
        }
      }

      return false;
    }

    checkTapTime(id) {
      const dt = Date.now() - this.eventStartDownTime[id];

      if (dt < this.tapTime) {
        return true;
      }

      return false;
    }

    isActive() {
      //if (this.controls.control.controlPoints.length == 0) {
      return false;
    } ///////////////////////////////objects


    addObject(obj) {
      AKIT.control.addControlObject(obj.id, this, obj);
      this.mesh = obj;
    }

    addObjectControl(id, obj) {
      AKIT.control.addObjectControlProximity(id, this, obj);
      this.mesh = obj;
    }

    delObjectControlProximity() {
      AKIT.control.delObjectControlProximity(this.mesh);
    }

    delObject() {
      AKIT.control.delControlObject(this, this.mesh);
    }

    message() {// console.log(this.mesh.id,this.parent.index);
    }

  }
  /*  checkTapDistance(uid, point) {
        if (point != undefined) {
            if (this.pointStart[uid] != undefined) {
                const pdist = point.distanceTo(this.pointStart[uid]);
                //alogKitCtl("aring: (checkTapDistance) " + uid + " " + pdist + " " + this.tapDistance);
                if (pdist < this.tapDistance) {
                    return true;
                }
            }
        }
        return false;
    }*/
  // this.cacheStillOverDepth[id].set(pt.x,pt.y,pt.z)
  //  this.cacheStillOverDepth[id].setPoint(pt)             //TODO berts suggestion
  //   this.cacheStillOverDepth[id].multiplyScalar(this.eventStillOverDepth[id]);

  /*cachOverDepth = this.getOrCreateCached(this.cacheStillOverDepth, id, newPointVector);

  cachOverDepth = this.getOrCreateCached(this.cacheStillOverDepth, id, newPointVector);


  let cachOverDepth = this.cacheStillOverDepth[id];
  if(cachOverDepth  == undefined){
      cachOverDepth = this.cacheStillOverDepth[id] = new THREE.Vector3(0, 0, 0);
  }

  cachOverDepth.setPoint(pt);
  cachOverDepth.normalize();
  cacheStillOverDepth.multiplyScalar(this.eventStillOverDepth[id])
  return cacheStillOverDepth;


  return this.getOrCreateCached(this.cacheStillOverDepth, id, newPointVector)
          .setPoint(pt)
          .normalize()
          .multiplyScalar(this.eventStillOverDepth[id]);
  */

  /*createPointVector(){
      return new THREE.Vector3(0, 0, 0);
  }

  getOrCreateCached(cache, entryKey, entryFactory){
      // assume cache exists
      let entry = cache[entryKey];
      if(entry == undefined || entry == null){
          entry = cache[entryKey] = entryFactory();
      }
      return entry;
  }

  */

  class AKIT_Control3DRayObject extends AKIT_Control3DObject {
    constructor(cparent) {
      super();
      this.parent = cparent;
      AKIT.alogKitCtl2(' (control3DRayObj-init) ' + cparent);
    } ///////////////////////////////base events


    eventDown(id, grp, data, opts) {
      AKIT.alogKitCtl2(' (control3DRayObj-eventDown) ' + id + ' ' + grp + ' ' + data + ' ' + opts);

      if (this.parent.eventDownCheck(id, opts)) {
        this.parent.eventDown(id, grp, data, opts);
        this.startDownEvent(id, grp, opts);
        return true;
      }

      return false;
    }

    eventDrag(id, grp, data, opts) {
      AKIT.alogKitCtl2(' (control3DRayObj-eventDrag) ' + id + ' ' + grp + ' ' + JSON.stringify(data) + ' ' + this.eventStartDownTime[id]);

      if (this.eventStartDownTime[id] != undefined) {
        let pt = this.eventStillDownPoint[id]; //  console.log(pt,this.eventStillDownPoint[id])

        AKIT.alogKitCtl2(' (control3DRayObj-eventDrag2) ' + id + ' ' + grp + ' ' + JSON.stringify(pt));
        this.stillDownEvent(id, grp, data.point, data.origin);
        this.parent.eventDrag(id, grp, data, opts, pt, data.origin);
      }
    }

    eventMove(id, grp, data, opts, pt, origin) {
      AKIT.alogKitCtl2(' (control3DRayObj-eventMove) ' + id + ' ' + grp + ' ' + data + ' ' + opts);
      this.stillOverEvent(id, grp, data, opts, pt, origin);
      this.parent.eventHover(id, grp, data, opts, pt, origin);
    }

    eventOver(id, grp, data, opts, pt, origin) {
      AKIT.alogKitCtl2(' (control3DRayObj-eventOver) ' + id + ' ' + grp + ' ' + data + ' ' + opts);
      this.stillOverEvent(id, grp, data, opts, pt, origin);
      this.parent.eventOver(id, grp, data, opts, pt, origin);
    }

    eventOverTimer(id) {
      if (this.stillOverEventTimer(id)) return true;
    }

    eventOut(id, grp, data, opts, origin) {
      this.stillOverEventEnd(id);
      this.parent.eventOut(id, grp, data, opts, origin);
    }

    eventOutEnd(id) {
      this.stillOverEventEnd(id);
    }

    eventUp(id, grp, data, opts) {
      this.stillDownEventEnd(id, grp);
      this.parent.eventUp(id, grp, data, opts);
    }

    eventDistance(id, grp, dist) {
      this.parent.eventDistance(id, grp, dist);
    }

    eventDefault(id, grp, point) {}

    eventUpSwitch(id, grp, data, opts) {
      this.clearEvent(id); //  this.parent.eventUpSwitch(id,grp,data,opts);
    }

    eventDownSwitch(id, grp, data, opts) {
      // console.log('eventDownSwitch',this,id,grp,data)
      this.startDownEvent(id, grp, opts);
    } ////////////////////////////////events


  }

  class AKIT_ObjectType extends AKIT_Object {
    constructor() {
      //AKIT_ObjectType,
      super();
      this.updated = false;
      this.renderOrder = 0;
      this.world = false;
      this.propertyObject = {};
      this.ready = false;
      this.loader = false; //set loader placeholder
    }

    init() {} ///////////////////////////////states


    add(vis) {
      this.world = true;
      AKIT.scene.scene.add(this.object);
    }

    remove() {
      this.world = false;
      AKIT.scene.scene.remove(this.object);
    }

    show() {
      this.object.visible = true;
    }

    hide() {
      this.object.visible = false;
    }

    visible(amt) {
      this.setOpacity(amt);
    }

    store() {
      this.remove();
    }

    retrieve() {}

    delete() {
      this.remove();
    }

    run() {}

    step() {}

    active(opt) {
      if (this.ready == false) {
        if (this.isready()) {
          this.ready = true;
        } else {
          return this.loaderRun();
        }
      }

      if (this.ready) {
        if (this.object != undefined) {
          if (this.isVisible() == false) {
            this.loaderStop();
            this.add();
            this.show();
            this.run();
            this.step();
            if (opt != undefined) this.activeOpts(opt);
            console.log('add', this.object, opt);
            return true;
          }

          this.step();
        }
      }

      return false;
    }

    activeOpts(opts) {
      if (opts.point != undefined) {
        let pt = opts.point;
        this.positionXYZ(pt.x, pt.y, pt.z); //  console.log(this,pt)
      }
    }

    inactive(opt) {
      if (this.isVisible()) {
        this.hide();
        this.remove();
        this.stop();
        console.log('rem', this.object);
      }

      this.loaderStop();
    }

    isready() {
      //override
      return true;
    } ///////////////object loader


    loaderSet(name) {
      // if (type == 'ar')
      //  if (this.checkLoader()) {
      //  }
      this.loader = true;
      this.loaderState = false;
      this.loaderName = name;
    }

    loaderRun() {
      if (this.loader) {
        this.loaderShow();
        AKIT.loader.update(this.loaderName); // console.log('loader run');

        return true;
      }

      return false;
    }

    loaderStop() {
      if (this.loader) {
        this.loaderHide();
      }
    }

    loaderHide() {
      if (this.loaderState) {
        this.loaderState = false;
        AKIT.loader.hide(this.loaderName); //  console.log('loader hide');
      }
    }

    loaderShow() {
      if (this.loaderState == false) {
        this.loaderState = true;
        AKIT.loader.show(this.loaderName); //   console.log('loader show');
      }
    }

    loaderAdd() {} ////////////////////////////////////////////


    isVisible() {
      return this.world;
    } ///////////////////////////////////////////control events


    registerController(controlObj) {
      controlObj.addObject(this.object);
    }

    control() {
      this.properties['control'] = new AKIT_Control3DRayObject(this);
      this.properties.control.init(); // console.log(this)

      this.properties.control.addObject(this.object);
    }

    eventDownCheck(id, opts) {
      return true;
    }

    eventDown(id, grp, data, opts, pt) {
      console.log('eventDown', grp, data, opts, pt, this.isVisible());
    }

    eventOver(id, pter, opts, point) {}

    eventOut(id, pter, opts) {}

    eventUp(id, pter, opts) {}

    eventHover(id, pter, opts, point) {}

    eventDrag(id, grp, data, opts, pt) {}

    eventTapCheck() {
      return true;
    }

    eventTap() {} //////////////////////////////////world


    position(pos) {
      this.object.position.x = pos.x;
      this.object.position.y = pos.y;
      this.object.position.z = pos.z; //  AKIT.alogKit("(aobj-position): " + this.object);
    }

    positionXYZ(x, y, z) {
      this.object.position.x = x;
      this.object.position.y = y;
      this.object.position.z = z;
    }

    rotation(pos) {
      this.object.rotation = pos;
    }

    rotationXYZ(x, y, z) {
      this.object.rotation.x = x;
      this.object.rotation.y = y;
      this.object.rotation.z = z;
    }

    rotationXYZRadians(x, y, z) {
      this.object.rotation.x = x * Math.PI;
      this.object.rotation.y = y * Math.PI;
      this.object.rotation.z = z * Math.PI;
    }

    getPosition() {
      return this.object.position;
    }

    scaleXYZ(x, y, z) {
      this.object.scale.x = x;
      this.object.scale.y = y;
      this.object.scale.z = z;
    } ///////////////////////////////////////////////////////////object


    meshObject(geometry, material) {
      this.object = new THREE.Mesh(geometry, material);
      AKIT.alogKit('aobj-mesh:' + this.object.id);
    }

    meshObjectGeometry() {
      this.object.geometry = this.child.geometry;
    }

    meshObjectGeometryUpdate() {
      this.meshObjectGeometryDelete();
      this.object.geometry = this.child.geometry;
    }

    meshObjectGeometryDelete() {
      this.object.geometry = null; //delete this.object.geometry;
    }

    meshObjectUpdateAll() {
      const geometry = this.object.geometry;
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      geometry.normalsNeedUpdate = true;
      geometry.verticesNeedUpdate = true;
    }

    meshObjectUpdate() {
      this.object.geometry.verticesNeedUpdate = true;
    }

    meshObjectUpdateBoundary() {
      this.object.geometry.verticesNeedUpdate = true;
      this.object.geometry.computeBoundingSphere();
    }

    meshObjectNormalsUpdate() {
      this.object.geometry.verticesNeedUpdate = true;
      this.object.geometry.normalsNeedUpdate = true;
    }

    meshRenderOrder(ro) {}

    dynamic() {} //this.object.geometry.dynamic = true;
    /////////////////////////////////////////////////vertex


    updateVertices(list) {
      for (let i = 0; i <= list; i++) {
        const point = list[i];
        this.setVertex(i, point.x, point.y, point.z);
      }
    }

    getVertex(i) {
      return this.object.geometry.vertices[i];
    }

    setVertex(v, point) {
      this.object.geometry.vertices[v].set(point.x, point.y, point.z);
    }

    setVertexXYZ(v, px, py, pz) {
      const verticePos = this.object.geometry.vertices[v];
      verticePos.x = px;
      verticePos.y = py;
      verticePos.z = pz;
    } /////////////////////////////////////////////////scale


    updateScale(v) {
      this.object.scale.x = v;
      this.object.scale.y = v;
      this.object.scale.z = v;
    }

    updateScaleXYZ(x, y, z) {
      this.object.scale.x = x;
      this.object.scale.y = y;
      this.object.scale.z = z;
    } //////////////////////////////////////////////////material


    setOpacity(value) {
      this.object.material.opacity = value;
    }

    setColorRGB(r, g, b) {
      this.object.material.color.setRGB(r, g, b);
    }

    setCustomColorRGB(r, g, b) {
      const color = this.object.material.uniforms.customColor.value;
      color.r = r;
      color.g = g;
      color.b = b;
    } ///////////////////////////////////////////////////////////////texture


    imageTextureUpdate(newimage) {
      this.object.texture.image = newimage;
      this.object.texture.needsUpdate = true;
    }

    textureUpdate() {
      this.object.material.needsUpdate = true;
    } /////////////////////////////////////////////////////////child


    addChildGeometry(id, c) {
      this.addChild('geometry', c, id);
    }

    storeChildGeometry(id) {
      this.storeChild('geometry', id);
    }

    restoreChildGeometry(id) {
      if (this.restoreChildObject(id, 'geometry')) return true;
      return false;
    }

    restoreChildObject(id, name) {
      this.storeChild(name, id);
      let c = this.restoreChild(id, name);

      if (c != undefined) {
        this.unsetChild(name);
        this.setChild(name, c, id);
        return false;
      }

      return true;
    } /////////////////////////////////////////////////////////object properties


    addObjectProperty(type) {
      let objP;

      switch (type) {
        case 'visible':
          objP = new AKIT_ObjectPropertyVisible(this);
      }

      this.propertyObject[type] = objP;
      return objP;
    }

  }

  class AKIT_ObjectMaterial extends AKIT_Object {
    constructor() {
      super();
    } //AKIT_ObjectMaterial,


    setOpacity(p) {}

    materialDebug() {
      const material = new THREE.MeshBasicMaterial({
        //color: this.colorDefault,
        side: THREE.DoubleSide,
        wireframe: true
      });
      return material;
    }

    addMaterial(material) {
      if (this.properties.debug) this.properties['material'] = this.materialDebug();else this.properties['material'] = material;
    }

    getMaterial() {
      return this.properties.material;
    }

    setTexture() {}

  }

  class AKIT_ObjectMaterialWire extends AKIT_ObjectMaterial {
    constructor() {
      super();
      this.material();
    } //AKIT_ObjectMaterialWire,


    material() {
      this.properties['material'] = new THREE.MeshBasicMaterial({
        //color: this.colorDefault,
        color: 0x000000,
        side: THREE.DoubleSide,
        wireframe: true
      });
    }

  }

  class AKIT_ObjectTypeSphereDebug$1 extends AKIT_ObjectType {
    constructor(radius, w, h) {
      super();
      this.radius = radius;
      this.widthSegments = w;
      this.heightSegments = h;
      this.id_geometry = 'sphere_' + this.radius + '_' + this.widthSegments + '_' + this.heightSegments;
      this.setType('debugObject', 'debugObject');
      this.geometry();
      this.material();
      this.meshObject(this.child.geometry, this.child.material.properties.material); // this.add();
    } /////////////////////////////////////////////////////


    store() {
      this.storeChildGeometry(this.id_geometry);
      this.remove();
    }

    restore() {}

    geometry() {
      if (this.restoreChildGeometry(this.id_geometry)) {
        this.addChildGeometry(this.id_geometry, new THREE.SphereGeometry(this.radius, this.widthSegments, this.heightSegments));
        this.child.geometry.computeBoundingSphere();
      }
    }

    material() {
      this.addChild('material', new AKIT_ObjectMaterialWire());
    }

  }

  class AKIT_ObjectMaterialBasicImage extends AKIT_ObjectMaterial {
    constructor(map, t) {
      super();
      this.properties['transparent'] = false;
      if (t != undefined) this.properties['transparent'] = t;
      this.material(map);
    }

    material(image) {
      this.properties['material'] = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: this.properties.transparent,
        map: image,
        color: 0xffffff,
        depthTest: false
      });
    }

  }

  class AKIT_ObjectTexture extends AKIT_Object {
    constructor() {
      //AKIT_ObjectTexture
      super();
    }

    update(img) {
      this.properties.texture.image = img;
      this.properties.texture.needsUpdate = true;
    }

  }

  class AKIT_ObjectTextureAnimator extends AKIT_ObjectTexture {
    constructor(p, image) {
      super();
      this.properties['parent'] = p;
      this.loader(image); // this.texture();
    } //AKIT_ObjectTextureImage,
    //image(image) {
    //  this.properties['image'] = new THREE.ImageUtils.loadTexture(image );
    //}


    loader(image) {
      let textureLoader = new THREE.TextureLoader();

      let _me = this;

      textureLoader.load(image, function (t) {
        _me.texture(t);
      }, function (xhr) {
        console.log(xhr);
      }, function (xhr) {});
    }

    texture(t) {
      t.generateMipmaps = true;
      t.magFilter = THREE.LinearFilter;
      t.minFilter = THREE.LinearFilter;
      this.properties['textureAnimator'] = new TextureAnimator(t, 30, 1, 30, 50); // texture, #horiz, #vert, #total, duration.

      this.properties['texture'] = t;
      this.properties.parent.loaded();
    }

    update() {
      var delta = AKIT.clock.getDelta();
      this.properties.textureAnimator.update(1000 * delta);
    }

  }

  function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
    // note: texture passed by reference, will be updated by the update function.
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert; // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet.

    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical); // how long should each image be displayed?

    this.tileDisplayDuration = tileDispDuration; // how long has the current image been displayed?

    this.currentDisplayTime = 0; // which image is currently being displayed?

    this.currentTile = 0;

    this.update = function (milliSec) {
      this.currentDisplayTime += milliSec;

      while (this.currentDisplayTime > this.tileDisplayDuration) {
        this.currentDisplayTime -= this.tileDisplayDuration;
        this.currentTile++;
        if (this.currentTile == this.numberOfTiles) this.currentTile = 0;
        var currentColumn = this.currentTile % this.tilesHorizontal;
        texture.offset.x = currentColumn / this.tilesHorizontal;
        var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
        texture.offset.y = currentRow / this.tilesVertical;
      }
    };
  }

  class AKIT_ObjectLoaderTypeSpinner extends AKIT_ObjectType {
    constructor(image, planeX, planeY, imageWidth, imageHeight, debug) {
      super();
      this.properties['image'] = image;
      this.properties['planeX'] = planeX;
      this.properties['planeY'] = planeY;
      this.properties['scale'] = 1.0;
      this.properties['imageHeight'] = imageHeight;
      this.properties['imageWidth'] = imageWidth;
      this.properties['debug'] = debug;
      this.setType('planeSpinner', 'planeSpinner-' + planeX + '_' + planeY);
      this.properties['size'] = planeX * planeY;
      this.properties['rotation'] = 0;
    }

    init() {
      this.geometry();
      this.texture();
    }

    loaded() {
      this.material();
      this.mesh();
      this.setOpacity(0.7);
      AKIT.loader.ready('spinner');
    }

    texture() {
      // const c = new AKIT_ObjectTextureImage(this.child.canvas);
      const c = new AKIT_ObjectTextureAnimator(this, this.properties.image);
      this.addChild('texture', c);
    }

    material() {
      if (this.properties.debug) this.addChild('material', new AKIT_ObjectMaterialWire());else {
        this.addChild('material', new AKIT_ObjectMaterialBasicImage(this.child.texture.properties.texture, true)); // this.child.material.properties.material.depthWrite = false;
      }
    } ///////////////////////////////////////////////////////////


    geometry() {
      this.properties['geometry'] = new THREE.PlaneBufferGeometry(this.properties.imageWidth, this.properties.imageHeight, this.properties.planeX, this.properties.planeY);
    }

    mesh() {
      this.meshObject(this.properties.geometry, this.child.material.properties.material);
      this.meshObjectUpdateAll();
    }

    update() {
      if (this.child.texture != undefined) this.child.texture.update();
    } //point() {
    //  this.object.rotation.setFromRotationMatrix(AKIT.scene.camera.matrix);
    //}


  }
  /*
    canvas() {
      const c = document.createElement('canvas');
      this.addChild('canvas', c);
    }

    context() {
      this.properties['context'] = this.child.canvas.getContext('2d');
    }

    image() {
      this.properties['image'] = new Image();
      this.properties.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABK1JREFUeNqMVt1ZGzkUvVfS4IW1l8GO82w6IBXE7mCpAFMB+Pt4Z6iApALcAe4AU0HoAJfg7BPYHinnXmmciX+y0YdmJHnQ0bk/R5cvh5cUyFPwRD4EChgEvGWMB36R3+JaiTkmD5gOs8yNb25uLlerFf1pM2yIGA82TEY7xow1oj4GBU6S6yywPNG4JwDH+XGv0Whs7ndN8n97mmPsLCSYgy7ImPQE/pFDyAF+7L0fgTNFUDBcLal90taD1doQ/T6NT9DnW8zkT+jJuQVYukG3hifCVk/L3JOxMBa8VVlSp9MhHKLaB+zpNo1fdgEpmByuMqUAV5viOQLwXNax9KBAFNEEpN1pUwnQmvl6aTza6zNjrCKaymeyOdYAMgfg18iG4T/qw+AC94zvpzDjcwqOXo3VGH26H0xMZ7jPxgT0R2zUi4BYt6bAfEbJvJFZKA4ODgZ5nhcJLE9mk35X21vWC/TXKmiwr2xszoQd/PQv3t/QCzY2twpqBpb5FKOp+hCgzWaTWq0W1Xx0ij5An9WC5VtiLMwvNBrVaSGMvQk5jHQVPN7sb0HzAtE+QJrNgrcUNEARieWCut0ugR0tl8sKcJ5Ahc3jRviPK8ZGTaaBwGKyT+gTiwM4a3Jrba6MbeVXo5F4kp9shn29ndUYC9vLirGDXzRhrYhD8DME5Hkg22df5rDYS/RXmVIsaP/Q/SXs600YnifTjbeSWliEdTYb3QyTqYfdDKTL4B1KS6tVqf6SgGq3P9BvZGpvNIrPCgVKZlGlCDQDxJiCjVppCab05DJHzb+b1Gm36X80cVjLuzozexs0f6IgRkA5XRhzIixRL1+IzhwdHVHrn1Y9oXe1i10aKT6bGGhg1CKK+cT0zCGCs0oXTIogybJMw/779//o48duMvnO9rzLn+Kz8wgS5Shqo4njpCoOQA5Ajb8adHh4SMvVghaLhYb/HsBip88krNVISSEigOlhjmi0LziNhr6wOsgO9C1339vbGznnNAU2AM9Svk235cqKieKGkldAf7DGvTrjnjJnzyQoMu0ZTuZgUqvmlYR+f39XIE4uqCX1E/rDZpCYmKwOOmivAfYK9KF1AM7EdG4uAMLAOjmQideQXOJQkyUisqYiFRhtSFbxCxj8do0T30dmTvLhC+an0MZZVBHX09tBTG4qFigZEJEChjTIEwtRik81Qa7uOQU0IrYAe7FRjqYw6SlYjgAyN1GmHsFIGPfVnxzFuFITKEkfYK+oWZ5qKlIkcZ7UE92oXBmeIgIxtAO5UtSHqo9uiLW+sme5ejSIRASeAFR4LYy8MMzL1aq3EYWzJF28BgMEzGYpBkrMKelgl+P6uTcVY8NjLYyYPwMTCcufSaouH6al9xNJcjC82vDb9uVZKbrWIumNO+waVsu1TCC+Wxcg6xaSpsZSYM2wLO9/U8qZWH+wztQnsfAxV/E3MIKZVf1FsmJVV8mamhEmxZ0X7sSsABsGv1tZJGejmptU7FBUDYzPAXQBwFEEl+9+stFEroJEci2ELwIMmZuWoSTE9DYYcWVCjlJrZWMpeBhlAEqBiulPE84S3ixU5gSTwGGOdyEVNJXxA8nPevshwABHktBS1YoQ+QAAAABJRU5ErkJggg=='; // Set source path

     // this.properties.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAyVBMVEUAAAC9vsDCw8W9v8G9vsD29/fr7O29vsDm5+jx8fK/wML29vf///+9vsHR0tPm5+jt7u7w8PHr7Ozc3d7n6OnExcfGx8nJyszMzM7V1tjZ2tvf4OG9vsDHyMrp6uvIycu9v8HAwcTPz9HCw8W9vsC9vsDBwsTj5OXj5OXW19i9vsDm5+jw8PHy8vL09fW9vsDFxsjJyszAwsS9vsDU1dbLzM7Y2drb3N3c3d7e3+DHyMrBwsTh4uPR0tPDxcfa293R0tTV1ti9vsAll6RJAAAAQnRSTlMA7+t/MAZHQDYjHxABv6xSQjEgFgzi2M7Emop0cGVLD/ryt7Cfj3dmYWBgWjgsGd/Cv7SvopSSg4B6eHZrQjkyKx1dd0xhAAAA9klEQVR4AYWPeXOCMBBHFxIgCQKC3KCo1Wprtfd98/0/VBPb6TC0Wd+/783+ZqELrQkRoIMujFbiaLTwpESC029reB7919d7u6SgYaE8aUCivW84oEUY0lPQc408pxBqHxCIHGiw4Lxtl5h35ALFglouAAaZTj00OJ7NrvDANI/Q4PlQMDbNFA3ekiQRaHGRpmM0eMqyyxgLRlme4ydu8/n8Az3h+37xiRWv/k1RRlhxUtyVD8yCXwaDflHeP1Zr5sIey3WtfvFeVS+rTWAzFobhNhrFf4omWK03wcS2h8OzLd/1TyhiNvkJQu5amocjznm0i6HDF1RMG1aMA/PYAAAAAElFTkSuQmCC';

    }

    draw() {

     // this.properties.context.drawImage(this.properties.image, 0, 0);

       this.properties.context.globalCompositeOperation = 'destination-over';
      this.properties.context.save();
      this.properties.context.clearRect(0, 0, 27, 27);
      this.properties.context.translate(13.5, 13.5); // to get it in the origin
      this.properties.rotation += 1;
      this.properties.context.rotate(this.properties.rotation * Math.PI / 64); //rotate in origin
      this.properties.context.translate(-13.5, -13.5); //put it back
      this.properties.context.drawImage(this.properties.image, 0, 0);
      this.properties.context.restore();

    }

   */

  class AKIT_AppLoader {
    constructor() {
      this.loaders = {};
      this.loadersArgs = {};
    }

    add(name, args) {
      //AKIT_ObjectARTypeCubeLoader
      let l;
      let readyNow = false;

      if (name == 'test') {
        let s = args.size;
        l = new AKIT_ObjectTypeSphereDebug$1(s, s, s);
        readyNow = true;
      }

      if (name == 'spinner') {
        let s = args.size;
        l = new AKIT_ObjectLoaderTypeSpinner('assets/img/spinner.png', s, s, args.len, args.len, false);
      }

      l.init();
      this.loaders[name] = l;
      this.loadersArgs[name] = args;
      if (readyNow) this.ready(name);
    }

    ready(name) {
      let l = this.loaders[name];
      let args = this.loadersArgs[name];
      this.argumentsSet(l, args);
      AKIT.alogKit('(loader-add): ' + name + ' ' + args);
    }

    show(name) {
      let l = this.loaders[name];
      l.add();
      l.show(); //  console.log('show loader');
    }

    hide(name) {
      let l = this.loaders[name];
      l.hide();
      l.remove(); // console.log('hide loader');
    }

    update(name) {
      this.loaders[name].update();
    }

    argumentsSet(lobj, args) {
      // let oscale = args.scale;
      //this.updateScale(oscale);
      let orot = args['rotate'];

      if (orot != undefined) {
        lobj.rotationXYZ(orot.x * Math.PI, orot.y * Math.PI, orot.z * Math.PI); //    console.log(lobj,orot)
      }
    }

  }

  class AKIT_ObjectARType extends AKIT_ObjectType {
    constructor() {
      super();
    }

    activeSet(opt) {
      if (this.active(opt)) {
        this.setFocusObject();
        return true;
      }

      return false;
    }

    activeUnset(opt) {
      this.inactive(opt);
    }

    settings(d) {
      this.properties['settings'] = d;
    }

    set() {
      var olist = this.properties['settings'];
      let oscale = olist.scale;
      this.updateScale(oscale);
      let orot = olist.rotate;

      if (orot != undefined) {
        this.rotationXYZ(orot.x * Math.PI, orot.y * Math.PI, orot.z * Math.PI);
      } //  this.meshObjectUpdateAll();

    }

    run() {
      if (this.properties.artype == 'video') this.runVideo();
    }

    stop() {
      if (this.properties.artype == 'video') this.stopVideo();
    }

    step() {
      if (this.properties.artype == 'video') this.stepVideo();
    }

    setFocusObject() {
      if (this.properties.artype == 'video') {
        APP.run.app.setFocusAction('autoplay', this);
      } else {
        APP.run.app.clearFocusAction();
      }
    } ///////////////////////////////////////////////////////////////////////////control


  }

  class AKIT_ObjectTextureImage extends AKIT_ObjectTexture {
    constructor(image) {
      super();
      this.texture(image);
    } //AKIT_ObjectTextureImage,


    texture(image) {
      const texture = new THREE.Texture(image);
      texture.generateMipmaps = false;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      this.properties['texture'] = texture;
    }

  }

  class AKIT_ObjectMaterialShader extends AKIT_ObjectMaterial {
    constructor(fragmentShaderUniform, fragmentShader, blending) {
      //AKIT_ObjectMaterialShader,
      super();
      this.type = 'materialShader';
      this.properties['fragmentShaderUniform'] = fragmentShaderUniform;
      this.properties['fragmentShader'] = fragmentShader;
      this.properties['blending'] = blending;
      this.material();
    }

    material() {
      var fragmentShaderUniform = this.properties.fragmentShaderUniform;
      var fragmentShader = this.properties.fragmentShader;
      var blending = this.properties.blending;
      return this.materialFragmentShader(fragmentShaderUniform, fragmentShader, blending);
    }

    materialFragmentShader(fragmentShaderUniform, fragmentShader, blending) {
      if (blending == undefined) blending = THREE.NormalBlending;
      return this.materialFragmentShaderBase(fragmentShaderUniform, fragmentShader, THREE.DoubleSide, blending); //THREE.AdditiveBlending
    }

    materialFragmentShaderBase(fragmentShaderUniform, fragmentShader, mside, mblending) {
      const uniform1 = fragmentShaderUniform;
      const vertexShader1 = fragmentShader.vertex;
      const fragmentShader1 = fragmentShader.fragment;
      const material = new THREE.ShaderMaterial({
        uniforms: uniform1,
        vertexShader: vertexShader1,
        fragmentShader: fragmentShader1,
        side: mside,
        blending: mblending,
        transparent: true,
        opacity: 0.1,
        alphaTest: 0.1,
        depthTest: false // wireframe:true

      });
      this.properties['material'] = material;
    }

    uniformUpdatePosition(x, y, z) {
      this.properties.material.uniforms['uPosition'].value[0] = x;
      this.properties.material.uniforms['uPosition'].value[1] = y;
      this.properties.material.uniforms['uPosition'].value[2] = z;
    }

    uniformUpdateRotation(x, y, z) {
      this.properties.material.uniforms['uRotation'].value[0] = x;
      this.properties.material.uniforms['uRotation'].value[1] = y;
      this.properties.material.uniforms['uRotation'].value[2] = z;
    }

    uniformUpdateScale(i, s) {
      this.properties.material.uniforms['uScale'].value[i] = s;
    }

    uniformUpdatePath(i, x, y, z) {
      this.properties.material.uniforms['uPath'].value[i].x = x;
      this.properties.material.uniforms['uPath'].value[i].y = y;
      this.properties.material.uniforms['uPath'].value[i].z = z;
    }

    uniformUpdatePathLength(l) {
      this.properties.material.uniforms['uPathLength'].value = l;
    }

    uniformUpdateDuration(t) {
      this.properties.material.uniforms['uDuration'].value = t;
    }

    uniformUpdateColor(r, g, b) {
      this.properties.material.uniforms['uColor'].value.r = r;
      this.properties.material.uniforms['uColor'].value.g = g;
      this.properties.material.uniforms['uColor'].value.b = b;
    }

  }

  class AKIT_ObjectShaderVignette {
    constructor(texture) {
      this.properties = {};
      this.init(texture);
    }

    init(texture) {
      this.properties['color'] = 0xffffff;
      this.properties['fragmentShaderUniform'] = this.uniform(texture);
      this.properties['fragmentShader'] = this.fragmentShader();
    }

    uniform(texture) {
      const fragmentShaderUniform = {
        uTexture: {
          type: 't',
          value: texture
        },
        // uColor: { type: 'c', value: new THREE.Color(this.properties.color) },
        customValue: {
          type: 'f',
          value: 0.5
        }
      };
      return fragmentShaderUniform;
    }

    fragmentShader() {
      const fragmentShader = {
        vertex: ['varying vec2 vTexCoord;', 'void main(void) {', 'vTexCoord = uv;', 'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );', 'gl_Position = projectionMatrix * mvPosition;', '}\n'].join('\n'),
        fragment: ['uniform sampler2D uTexture;', //'uniform vec3 uColor;',
        'uniform vec2 resolution;', 'varying vec2 vTexCoord;', 'void main(void) {', 'vec4 texColor = texture2D(uTexture, vTexCoord);', // 'float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));', //grayscale
        // 'vec3 imgColor = vec3(gray) * uColor;',
        // 'texColor.rgb = mix(texColor.rgb, imgColor, 0.9);',
        //////////////////////////////////////////////////////////////////////////////////////////////
        //vignette
        'float aspect = 3.0/3.0;', 'float scale = .9;', //.6
        'float offset = 0.0;', 'float smoothingX = -0.4;', //-0.4
        'float smoothingY = 0.8;', // 0.8
        'vec2 pos = vTexCoord;', 'pos -= 0.5;', 'pos.x *= aspect;', 'pos /= scale;', 'pos -= offset;', 'float dist = length(pos);', 'dist = smoothstep(smoothingX, smoothingY, 1.-dist);', ' vec3 color2 = vec3(0.0,0.0,0.0);', 'vec3 color = mix(color2, texColor.rgb, dist);', //////////////////////////////////////////////////////////////////////////////////////////////
        //////luma
        'float threshold;', 'float clipBlack=0.9;', //0.5
        'float clipWhite=0.9;', //1.0
        'const vec3 lumcoeff = vec3(0.2125,0.7154,0.0721);', 'float luma = dot(color,lumcoeff);', 'float alpha = 1.0 - smoothstep(clipBlack, clipWhite, luma);', 'gl_FragColor = vec4(color, min(1.0, alpha) );', //////////////////////////////////////////////////////////////////////////////////////////////
        //////addcolour
        //     'float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));',  //grayscale
        //     'vec3 imgColor = vec3(gray) * customColor;',
        //     'texColor.rgb = mix(texColor.rgb, imgColor, 0.9);',
        //   'gl_FragColor = vec4(color, 1.0);',
        '}'].join('\n')
      };
      return fragmentShader;
    }

  } //   'vec2 position = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y) - vec2(0.5);',
  //  'float len = length(position);',
  //  'float vignette = smoothstep(RADIUS, RADIUS-SOFTNESS, len);',
  //   'texColor.rgb = mix(texColor.rgb, texColor.rgb * vignette, 0.5);',
  //    'texColor.rgb = texColor.rgb * 0.9;',
  // 'gl_FragColor = vec4(texColor.rgb, 1.0);',
  // 'float aspect = 512.0/ 512.0;',
  //       'vec2 p = gl_FragCoord.xy / resolution.xy;',
  //     'float darkness = 1.45;',
  //   'vec2 textureCoords = p - 0.5;',
  //     'float vignette = 1.0 - (dot(textureCoords, textureCoords) * darkness);',
  //   'gl_FragColor= vec4(vignette, vignette, vignette, 1.0-vignette);',
  //  'vec2 position = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y) - vec2(0.5);',   //
  //   'gl_FragColor = vec4(texColor.rgb, 0.2);',
  //  'gl_FragColor = texColor;',
  //  'float vignette = 20.0;',
  //  'float len = 0.5;',
  //  'gl_FragColor = vec4( vec3(len), 1 );',
  // 'gl_FragColor = texColor;',// * vColor;',

  /*         'precision mediump float;',

               'varying vec2 vTexCoord;',


                 'varying vec2 vUv;',

                'uniform sampler2D customTexture;',
                'uniform float customValue;',

                'void main(void) {',
                 //   'gl_FragColor = texture2D(customTexture, vUv);',

                '	vec4 pixel = texture2D(customTexture, vUv);',
                '	vec2 pos = vUv.xy - 0.5;',
                '	float vignette = 1.0 - (dot(pos, pos) * customValue);',
                '	gl_FragColor = vec4(pixel.rgb * vignette, pixel.a);',*/
  // first convert to screen space
  //   '	vec4 screenPosition = vec4(position.xy * resolution / 2.0, position.z, position.w);',
  //   '	screenPosition = transform * screenPosition;',
  // convert back to OpenGL coords
  //   '	gl_Position.xy = screenPosition.xy * 2.0 / resolution;',
  //   '	gl_Position.z = screenPosition.z * 2.0 / (resolution.x / resolution.y);',
  //   '	gl_Position.w = screenPosition.w;',
  //    'vTexCoord = texCoord;',
  //    'precision mediump float;',
  //    'attribute vec4 position;',
  //      'uniform vec2 resolution;',
  //      'uniform mat4 transform;',
  //     'attribute vec4 Color;',
  //     'varying vec4 vColor;',

  class AKIT_ObjectEffectVignette extends AKIT_Object {
    constructor(img) {
      super();
      this.init(img);
    }

    init(img) {
      this.texture(img);
      this.shader();
      this.material(); // this.addChild('material',new AKIT_ObjectMaterialWire());
    }

    getMaterial() {
      return this.child.material.properties.material;
    }

    setTexture(img) {
      this.child.texture.update(img);
    } /////////////////////////////////////////////////////


    texture(img) {
      this.addChild('texture', new AKIT_ObjectTextureImage(img));
    }

    shader() {
      this.addChild('shader', new AKIT_ObjectShaderVignette(this.child.texture.properties.texture));
    }

    material() {
      const p1 = this.child.shader.properties['fragmentShaderUniform'];
      const p2 = this.child.shader.properties['fragmentShader'];
      this.addChild('material', new AKIT_ObjectMaterialShader(p1, p2));
    }

  }

  class AKIT_ObjectVideo extends AKIT_Object {
    constructor(videoSrc, videoImg, imageWidth, imageHeight) {
      //AKIT_ObjectVideo,
      super();
      this.properties['videoSrc'] = videoSrc;
      this.properties['posterSrc'] = videoImg;
      this.properties['imageWidth'] = imageWidth;
      this.properties['imageHeight'] = imageHeight;
      this.properties.videoProps = {};
      this.properties.videoProps['duration'] = 0;
    } ///////////////////////////////////////standard media.video calls


    startVideo() {
      this.cueVideo(0);
    }

    cueVideo(ctime) {
      const seconds = ctime / 1000; //convert back to seconds
      // this.videoHalt();

      this.videoTime(seconds);
      this.videoCue();
    }

    stopVideo() {
      this.videoStop();
    }

    resetVideoTime() {
      this.videoTime(0);
      this.videoHalt();
    }

    setVideoTime(ctime) {
      const seconds = ctime / 1000; //convert back to seconds

      this.videoTime(seconds);
      this.videoHalt();
    }

    isVideoPlaying() {
      return this.properties.videoPlaying;
    }

    getVideoCurrentTime() {
      return this.videoTimeGet() * 1000;
    }

    getVideoTime() {
      const seekTime = 0;

      if (this.properties.videoMetaReady == true) {
        const dseconds = this.getVideoDuration();
        return dseconds;
      }

      return seekTime;
    }

    getVideoDuration() {
      return this.properties.videoProps.duration * 1000;
    }

    getSeekTime(cueTime, cueSegment) {
      let seekTime = -1;
      let dseconds;

      if (this.properties.videoMetaReady == true) {
        dseconds = this.getVideoDuration();

        if (dseconds < cueTime) {
          seekTime = 0;
        } else {
          seekTime = (dseconds - cueTime) * cueSegment;
        }

        AKIT.aloggerKitV('avideo: (getSeekTime):' + seekTime + ' ' + dseconds + ' ' + cueSegment);
      } else {
        AKIT.aloggerKitV('avideo: (getSeekTime-fail):' + this.properties.videoMetaReady);
      }

      return seekTime;
    } ////////////////////////////////////////media.video


    videoInit() {
      this.properties['videoReady'] = false;
      this.properties['videoMetaReady'] = false;
      this.properties['videoPlaying'] = false;
      this.properties['videoUpdated'] = false;
      this.properties['video'] = document.createElement('video'); //  this.properties['poster'] = document.createElement('canvas');

      this.videoProperties(); /////////////////////////////////////////////////////////////////////////////////////////////////////

      this.properties.video.src = this.properties.videoSrc; // this.properties.media.video.poster = this.properties.posterSrc;

      this.properties.video.width = this.properties.imageWidth;
      this.properties.video.height = this.properties.imageHeight; //  this.videoMute(true); /// dev

      AKIT.aloggerKitV('avideo: (init):' + this.properties.videoSrc + ' ' + this.properties.video.width + ' ' + this.properties.video.height);
    }

    videoClone(vobj, vduration) {
      this.properties['videoReady'] = true;
      this.properties['videoMetaReady'] = true;
      this.properties['videoPlaying'] = false;
      this.properties['videoUpdated'] = false;
      this.properties['video'] = vobj;
      this.videoProperties();
      this.properties.video.width = this.properties.imageWidth;
      this.properties.video.height = this.properties.imageHeight;
      this.properties.videoProps.duration = vduration;
    }

    videoProperties() {
      /////////////////////////////////////////////////////////////////////////properties
      //// safari hacks
      // this.properties.video.setAttribute('autoplay', true);
      this.properties.video.setAttribute('playsInline', 'playsinline'); // this.properties.video.playsinline = 'playsinline';
      // this.properties.video.controls = true;

      this.properties.video.setAttribute('controls', false); // this.properties.video.setAttribute('mute', true);
      //  setTimeout(() => {
      //    this.properties.video.removeAttribute('controls');
      // });
      //  this.videoTouchToPlay()
      // this.videoMute(true)
      // console.log('pv',this.properties.video)
    }

    videoURLReady() {
      this.videoEvents();
      this.videoLoad();
      AKIT.aloggerKitV('(aobj-videoObj-init):' + vname + ' ' + vsrc + ' ' + w + ' ' + h);
    }

    videoReinit(videoSrc, videoImg) {
      this.properties['videoSrc'] = videoSrc; //this.properties['videoImg'] = videoImg;

      this.properties['videoReady'] = false;
      this.properties['videoMetaReady'] = false;
      this.properties['videoPlaying'] = false;
      this.properties['videoUpdated'] = false;
      this.properties.video.src = this.properties.videoSrc; //  this.properties.poster.src = this.properties.posterSrc;

      AKIT.aloggerKitV('avideo: (init-re):' + this.properties.videoSrc);
    }

    videoReset() {
      this.properties['videoReady'] = false;
      this.properties['videoMetaReady'] = false;
      this.properties['videoPlaying'] = false;

      if (this.properties.video == undefined) {
        this.properties['video'] = document.createElement('video');
      }

      this.properties.video.removeEventListener('loadedmetadata');
      this.properties.video.removeEventListener('loadeddata');
      this.properties.video.removeEventListener('durationchange');
      this.properties.video.removeEventListener('error');
    }

    videoEvents() {
      this.properties.videoProps.src = this.properties.videoSrc;
      this.videoLoadEvents();
      this.videoErrorEvents();
      AKIT.aloggerKitV('(aobj-videoObj-events-set) ' + this.properties.video);
    }

    videoLoadEvents() {
      const _me = this;

      this.properties.video.addEventListener('loadedmetadata', function (e) {
        _me.properties.videoProps['duration'] = this.duration;
        AKIT.aloggerKitV('(aobj-videoObj-loaded meta) ' + _me.properties.video.id + ' ' + this.duration);
        _me.properties.videoMetaReady = true;

        _me.videoUpdated();
      });
      this.properties.video.addEventListener('loadeddata', function () {
        AKIT.aloggerKitV('(aobj-videoObj-loaded data) ' + _me.properties.video.id);
        _me.properties.videoReady = true;

        _me.videoUpdated();
      });
      this.properties.video.addEventListener('durationchange', function () {
        _me.properties.videoProps['duration'] = this.duration;
        AKIT.aloggerKitV('(aobj-videoObj-duration) ' + _me.properties.video.id + '  new:' + this.duration + '  old:' + _me.properties.videoProps['duration']);
        _me.properties.videoMetaReady = true; //  _me.videoPing();
      });
    }

    videoErrorEvents() {
      const _me = this;

      this.properties.video.addEventListener('error', function (e) {
        _me.properties.videoReady = -1;

        switch (e.target.error.code) {
          case e.target.error.MEDIA_ERR_ABORTED:
            AKIT.akitError('You aborted the media.video playback.', _me.properties.videoProps);
            break;

          case e.target.error.MEDIA_ERR_NETWORK:
            AKIT.akitError('A node.network error caused the media.video download to fail part-way.', _me.properties.videoProps);
            break;

          case e.target.error.MEDIA_ERR_DECODE:
            AKIT.akitError('The media.video playback was aborted due to a corruption problem or because the media.video used features your browser did not support.', _me.properties.videoProps);
            break;

          case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            AKIT.akitError('The media.video could not be loaded, either because the server or node.network failed or because the format is not supported.', _me.properties.videoProps);
            break;

          case e.target.error.ERR_CACHE_READ_FAILURE:
            AKIT.akitError('Cannot read the cache.', _me.properties.videoProps);
            break;

          default:
            AKIT.akitError('An unknown error occurred.' + e.target.error.code);
            break;
        }
      });
    }

    videoLoopEvents() {
      const _me = this;

      this.properties.video.addEventListener('ended', function () {
        _me.videoEnd();
      });
    }

    videoUpdatedCheck() {
      if (this.properties.videoUpdated) {
        this.properties.videoUpdated = false;
        return true;
      }

      return false;
    }

    videoUpdated() {
      if (this.properties.videoUpdated == false) {
        if (this.properties.videoReady == true) {
          if (this.properties.videoMetaReady == true) {
            this.properties.videoUpdated = true;
          }
        }
      }
    }

    videoReload() {
      this.videoLoad();
      AKIT.aloggerKitV('(aobj-videoObj-reload):' + this.properties.video.id + ' ' + this.properties.video.duration);
    }

    videoLoad() {
      this.properties.video.load(); //play/pause error

      AKIT.aloggerKitV('(aobj-videoObj-load) ' + this.properties.video.id);
    }

    videoCue() {
      //  console.log(this.properties);
      if (this.properties.videoReady == true) {
        if (this.properties.videoMetaReady == true) {
          if (this.properties.videoPlaying == false) {
            if (AKIT.env.browser != 'edge') {
              this.properties.video.play().catch(function (e) {
                AKIT.aloggerKitV('(aobj-videoObj-error-play) ' + this.properties.video.id + ' ' + e);
              }); //console.log(this.properties);
            } else {
              this.properties.video.play();
            }

            AKIT.aloggerKitV('(aobj-videoObj-play) ' + this.properties.video.id);
            this.properties.videoPlaying = true;
          }
        }
      }
    }

    videoPlay() {
      if (this.properties.videoPlaying == false) {
        this.properties.video.play();
        AKIT.aloggerKitV('(aobj-videoObj-play) ' + this.properties.video.id + ' ' + this.properties.videoPlaying + '  ' + this.properties.videoReady);
        this.properties.videoPlaying = true;
      }
    }

    videoHalt() {
      this.properties.video.pause();
      this.properties.videoPlaying = false;
    }

    videoStop() {
      if (this.properties.videoPlaying == true) {
        this.videoHalt();
        AKIT.aloggerKitV('(aobj-videoObj-stop) ' + this.properties.video.id);
      }
    }

    videoTime(ctime) {
      if (this.properties.videoReady == true) {
        if (this.properties.videoMetaReady == true) {
          if (this.properties.video.readyState === this.properties.video.HAVE_ENOUGH_DATA) {
            AKIT.aloggerKitV('(aobj-videoObj-time) ' + this.properties.video.id + ' ' + ctime);
            this.properties.video.currentTime = ctime;
          }
        }
      }
    }

    videoMute(mode) {
      this.properties.video.muted = mode;
    }

    videoTouchToPlay() {
      const _me = this;

      this.properties.video.addEventListener('touchend', function (e) {
        if (_me.properties.videoReady == true) {
          if (_me.properties.videoMetaReady == true) {
            if (_me.properties.videoPlaying == false) {
              _me.properties.video.play();

              console.log('play');
            }
          }
        }
      });
    }

    videoHasEnoughData() {
      if (this.properties.video.readyState === this.properties.video.HAVE_ENOUGH_DATA) {
        return true;
      }

      return false;
    }

    videoUpdate() {
      if (this.properties.videoReady == true) {
        if (this.properties.videoMetaReady == true) {
          if (this.properties.video.readyState === this.properties.video.HAVE_ENOUGH_DATA) {
            this.properties.context.drawImage(this.properties.video, 0, 0);
          }
        }
      }
    }

    videoTimeGet() {
      if (this.properties.videoReady == true) {
        if (this.properties.videoMetaReady == true) {
          if (this.properties.video.readyState === this.properties.video.HAVE_ENOUGH_DATA) {
            AKIT.aloggerKitV('(aobj-videoObj-time) ' + this.properties.video.id + ' ');
            return this.properties.video.currentTime;
          }
        }
      }

      return 0;
    }

    videoClose() {
      this.properties.videoReady = false;
      this.properties.videoMetaReady = false;
      this.properties.videoPlaying = false;
      this.proerties.textureImgLoaded = false;
      AKIT.aloggerKitV('(aobj-videoObj-close) ' + this.properties.video.id);
      this.properties.video.id = -1;
      this.properties.video.src = '';
    }

    videoEnd() {
      if (this.properties.videoProps.loop) this.cueVideo(0);
    }

    setVideoProperty(prop, value) {
      this.properties.videoProps[prop] = value;
    }

    getVideoProperty(prop, value) {}

  }

  class AKIT_ObjectVideoGroup$1 extends AKIT_ObjectVideo {
    constructor(videoSrc, videoImg, imageWidth, imageHeight) {
      //AKIT_ObjectVideo,
      super();
      this.properties['videoSrc'] = videoSrc;
      this.properties['posterSrc'] = videoImg;
      this.properties['imageWidth'] = imageWidth;
      this.properties['imageHeight'] = imageHeight;
      AKIT.video.registerVideo(videoSrc, imageWidth, imageHeight);
      this.properties['imageLoaded'] = false;
      this.properties['videoLoaded'] = false;
      this.init();
    }

    init() {// this.canvas();
      //   this.context();
      //   this.image();
    }

    reinit(videoSrc) {
      this.properties['videoSrc'] = videoSrc;
      AKIT.video.registerVideo(videoSrc, this.properties.imageWidth, this.properties.imageHeight);
      this.properties['imageLoaded'] = false;
      this.properties['videoLoaded'] = false;
    }
    /*
    image() {
      this.properties['image'] = new Image();
      var _me = this;
      // this.properties.image.onload = function() {
      _me.draw();
      _me.properties.imageLoaded = true;
     //  console.log('imgloaded');
      // };
       this.properties.image.src = this.properties.posterSrc;
    }
     canvas() {
      this.properties['canvas'] = document.createElement('canvas');
      this.properties.canvas.width = this.properties.imageWidth;
      this.properties.canvas.height = this.properties.imageHeight;
    }
     context() {
      this.properties['context'] = this.properties.canvas.getContext('2d');
    }
     draw() {
      // console.log(this.properties.canvas);
       this.properties.context.drawImage(
        this.properties.image,
        0,
        0,
        this.properties.imageWidth,
        this.properties.imageHeight
      );
    }*/


    check() {
      // console.log('check', this.properties.videoSrc);
      if (!this.properties.videoLoaded) {
        if (AKIT.video.checkVideo(this.properties.videoSrc)) {
          //master loaded?
          this.properties.videoLoaded = true;
          this.video(); //    console.log('loaded-v', this.properties.videoSrc);

          return true;
        }
      }

      return false;
    }

    checkImageReady() {
      return this.properties.videoLoaded;
    }

    video() {
      // var vobj = AKIT.media.video.getVideo(this.properties.videoSrc);
      // this.videoClone(vobj);
      var vprop = AKIT.video.getVideo(this.properties.videoSrc);
      var vobj = vprop.video;
      var vduration = vprop.videoProps.duration;
      this.videoClone(vobj, vduration);
    } ///////////////////////////////////////standard media.video calls


    getVideoDuration() {
      if (this.properties.videoLoaded) return super.getVideoDuration();
      return 0;
    }

    resetVideoTime() {
      if (this.properties.videoLoaded) super.resetVideoTime();
    }

    cueVideo(ctime) {
      if (this.properties.videoLoaded) ///add start seg
        super.cueVideo(ctime);
    }

    getVideoCurrentTime() {
      if (this.properties.videoLoaded) return super.getVideoCurrentTime();
      return 1;
    }

  }
  /*

  renderer.domElement.addEventListener("click", function(){
  				//- video.play();
  		//- });

        window.onload = function() {
          initCanvas();
        }
        var worker = new Worker("code_c7_6.js");
        var context, media.video, sctxt, count, canvas;
        var calls = 0;
        function initCanvas() {
          media.video = document.getElementsByTagName("media.video")[0];
          canvas = document.getElementsByTagName("canvas")[0];
          context = canvas.getContext("2d");
          scratch = document.getElementById("scratch");
          sctxt = scratch.getContext("2d");
          count = document.getElementById("count");
          media.video.addEventListener("play", postFrame, false);
          worker.addEventListener("message", drawFrame, false);
        }

        function postFrame() {
          w = 320; h = 160;
          sctxt.drawImage(media.video, 0, 0, w, h);
          frame = sctxt.getImageData(0, 0, w, h);
          arg = {
            frame: frame,
            height: h,
            width: w
          }
          worker.postMessage(arg);
        }

        function drawFrame (event) {
          msg = event.data;
          outframe = msg.frame;
          if (media.video.paused || media.video.ended) {
            return;
          }
          context.putImageData(outframe, 0, 0);
          // draw rectangle on canvas
          context.strokeRect(msg.x, msg.y, msg.w, msg.h);
          calls += 1;
          count.textContent = calls;
          setTimeout(function () {
            postFrame();
          }, 0);
        }
   */

  class AKIT_ObjectARTypePlaneVideoEffectVignette extends AKIT_ObjectARType {
    constructor(planeX, planeY, imageWidth, imageHeight, hostName, videoSrc, debug) {
      super();
      this.properties['planeX'] = planeX;
      this.properties['planeY'] = planeY;
      this.properties['scale'] = 0.1;
      this.properties['imageHeight'] = imageHeight;
      this.properties['imageWidth'] = imageWidth;
      this.properties['hostName'] = hostName;
      this.properties['videoSrc'] = videoSrc;
      this.properties['debug'] = debug;
      this.properties['artype'] = 'video';
      this.setType('planeVideo', 'planeVideo-' + planeX + '_' + planeY); // console.log(this.properties);
      //  this.init();
    }

    init() {
      if (this.properties['video'] == undefined) {
        this.video();
        this.material();
        this.geometry();
        this.mesh();
        this.meshObjectUpdateAll();
      } else {
        this.reinit();
      }
    }

    reconstruct(planeX, planeY, imageWidth, imageHeight, hostName, videoSrc, debug) {
      this.properties['planeX'] = planeX;
      this.properties['planeY'] = planeY;
      this.properties['scale'] = 0.1;
      this.properties['imageHeight'] = imageHeight;
      this.properties['imageWidth'] = imageWidth;
      this.properties['hostName'] = hostName;
      this.properties['videoSrc'] = videoSrc; //  this.reinit();
    }

    reinit() {
      this.properties.video.reinit(this.properties.videoSrc); // this.setTexture()
      // this.meshObjectUpdateAll();
    } /////////////////////////////////////////////////////
    // getVideoSrc() {
    //  return 'http://' + this.properties.host + '/' + this.properties.filename + '.webm';
    //}


    video() {
      const videoSrc = this.properties.videoSrc;
      const posterSrc = '';
      let imageWidth = this.properties.imageWidth;
      let imageHeight = this.properties.imageHeight; //  console.log(videoSrc, ima

      this.properties['video'] = new AKIT_ObjectVideoGroup$1(videoSrc, posterSrc, imageWidth, imageHeight); // this.initVideoMaterial();
    }

    material() {
      if (this.properties.debug) this.addChild('material', new AKIT_ObjectMaterialWire());else {
        // let m = new AKIT_ObjectEffectVignette(this.properties.video.properties.canvas);
        //  console.log(this.properties.video.properties);
        var defaultImage = undefined;
        this.addChild('material', new AKIT_ObjectEffectVignette(defaultImage));
      }
    }

    geometry() {
      this.properties['geometry'] = new THREE.PlaneBufferGeometry(this.properties.planeX, this.properties.planeY, this.properties.imageWidth, this.properties.imageHeight);
    }

    mesh() {
      this.meshObject(this.properties.geometry, this.child.material.getMaterial());
      this.properties.geometry.dynamic = true;
    }

    isready() {
      this.loadVideo();
      if (this.checkVideo()) return true;
      return false;
    }

    checkVideo() {
      if (this.properties['video'] != undefined) {
        if (this.properties.video.check()) {
          this.setVideoMaterial();
          this.textureUpdate();
          this.meshObjectUpdateAll();
          this.set();
          this.properties.video.startVideo();
          return true;
        }
      }

      return false;
    }

    setVideoMaterial() {
      this.child.material.setTexture(this.properties.video.properties.video);
    }

    loadVideo() {
      if (this.properties.video != undefined) {
        if (this.properties.video.checkImageReady()) {
          this.setVideoMaterial(); // console.log('set');
          // this.properties.video.videoUpdate();
          //  this.textureUpdate();

          return true;
        }
      }
    }

    stepVideo() {
      // this.properties.video.videoUpdate();
      this.setVideoMaterial();
    }

    runVideo() {
      this.properties.video.videoTime(0);
      this.properties.video.videoCue(0);
      AKIT.video.focus = this.properties.video;
    }

    clickVideo() {
      this.properties.video.videoTime(0);
      this.properties.video.videoCue(0);
    }

    stopVideo() {
      this.properties.video.videoStop();
    }

    reinitVideo(videoSrc) {
      this.video.reloader(videoSrc);
      this.video.videoReinit(videoSrc);
    } ////////////////////////////////////////////


    eventUp(id, pter, opts) {//alert('clicked')
      //  console.log('eventup1', id, pter, opts )
    }

    eventDown(id, grp, data, opts, pt) {
      this.clickVideo(); // console.log('eventDown1', grp,data,opts,pt,this.isVisible() )
    }

  }

  class AKIT_ObjectStoreType {
    constructor() {} //////////////////type getters


    getType(name) {
      var c = AKIT.store.restoreObject(name);

      if (c != undefined) {
        AKIT.alogPreload('(restore)' + ' ' + name + ' ');
        return c;
      }
    }

    preload() {
      for (let p in APP.preload) {
        this.preloadType(p);
      }
    }

    preloadType(tname) {
      let t = this.preloadData(tname);
      this.preloadTypeNo(t.number, tname, t.args);
    }

    preloadData(tname) {
      return APP.preload[tname];
    }

    preloadTypeNo(no, tname, targs) {
      for (let i = 0; i < no; i++) {
        let m = this.preloadTypeModule(tname, targs); //   m.init();

        AKIT.store.storeObject(tname, m);
        AKIT.alogPreload('(store) ' + i + ' ' + tname + ' ' + m);
      }
    }

    preloadTypeModule(tname, targs) {
      let objP;

      switch (tname) {
        case 'ARTypePlaneVideoEffectVignette':
          objP = new AKIT_ObjectARTypePlaneVideoEffectVignette(targs[0], targs[1], targs[2], targs[3], targs[4], targs[5], targs[6]);
          break;

        case 'ARTypeFile':
          objP = new AKIT_ObjectARTypeFile(targs[0], targs[1]);
          break;
      }

      return objP;
    }

  }

  class AKIT_ObjectStore$1 {
    constructor() {
      this.store = {};
      this.preloader = new AKIT_ObjectStoreType();
    }

    storeObject(id, c) {
      if (this.store[id] == undefined) this.store[id] = [];
      this.store[id].push(c);
    }

    restoreObject(id) {
      if (this.store[id] != undefined) {
        let clist = this.store[id];

        if (clist.length > 0) {
          let c = clist[0];
          clist.remove(0);
          return c;
        }
      }
    }

    get(name) {
      return this.preloader.getType(name);
    }

  }

  ///// AKIT - application toolkit (assimilate interactive three.js toolkit)
  class AKIT_AppObjectStore {
    constructor() {
      AKIT.initObjectStore = function () {
        AKIT.store = new AKIT_ObjectStore$1();
        AKIT.store.preloader.preload();
      };

      Array.prototype.storeIndex = function (from) {
        const obj = this[from];
        obj.store();
        const rest = this.slice(from + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
      };
    }
    /*
    getCloth() {
        if (this.child.cloth == undefined) {
        let cobj = AKIT.store.restoreObject('clothDynamic');
        if (cobj == undefined) {
          this.cloth();
          this.child.cloth.status = 0;
        } else {
          this.child.cloth = cobj;
          this.retrieve();
        }
        console.log('clothget ' + this.id)
      }
    }
      putCloth() {
      if (this.child.cloth != undefined) {
        this.store();
        AKIT.store.storeObject('clothDynamic', this.child.cloth);
        this.child.cloth = undefined;
        console.log('clothput ' + this.id)
      }
    }*/


  }

  class AKIT_ObjectPropertyURLLoader {
    constructor(p, u) {
      this.parent = p;
      this.id = p.id;
      this.init(u);
    }

    init(u) {
      this.URL = u;
      this.URLp = '';
      this.URLready = false;
      this.URLMediaready = false;
      this.URLTimeout = 4000;
      this.URLTimeoutCount = 0;
      this.URLTimer = Date.now();
    } //////////////////////////////////URL


    checkURLReady() {
      if (this.URLready == false) {
        if (this.URLTimer != 0) {
          if (this.URL != undefined) {
            if (this.URL != '') {
              //    if (this.media.agent.active == false) {
              if (this.checkURLTimeout() == true) {
                this.checkURL();
              } //    }

            }
          }
        }
      } else {
        ///check start
        if (this.URLMediaready == false) {
          if (this.URLTimer != 0) {
            if (this.URL != undefined) {
              if (this.URL != '') {
                //    if (this.media.agent.active == false) {
                if (this.checkURLTimeout() == true) {
                  this.checkMediaURL();
                } //    }

              }
            }
          }
        }
      }
    }

    checkURL() {
      AKIT.aloggerKitURL('anode: (media.agent-checkurl):' + this.id + ' ' + this.URL);
      this.URLTimer = 0;
      this.fileExistsCall(this.URL, this, this.fileExistsCallback);
    }

    checkURLCallback(status) {
      if (status == true) {
        AKIT.aloggerKitURL('anode: (media.agent-checkurl-call-ok):' + this.id + ' ' + this.URL);
        this.setURL();
      } else {
        AKIT.aloggerKitURL('anode: (media.agent-checkurl-call-timeout):' + this.id + ' ' + this.URL);
        this.setURLTimeout();
      }
    }

    checkURL2() {
      AKIT.aloggerKitURL('anode: (media.agent-checkurl):' + this.id + ' ' + this.URL);

      const _me = this;

      if (this.fileExists(this.URL)) {
        _me.setURL();
      } else {
        _me.setURLTimeout();
      }
    }

    setURL() {
      AKIT.aloggerKitURL('anode: (media.agent-set):' + this.id + ' ' + this.URL);
      if (this.URL == '') AKIT.aloggerKitURL('anode: (media.agent-set-null):' + this.id + ' ' + this.URL);

      if (this.URLready == false) {
        this.URLready = true;
        this.parent.setURLMedia();
        this.URLTimeoutCount = 0;
        this.URLTimer = Date.now();
      }
    }

    checkMediaURL() {
      AKIT.aloggerKitURL('anode: (media.agent-checkmedia):' + this.id + ' ' + this.URL);

      const _me = this;

      if (this.parent.checkURLMedia(this.URL, this.URLp)) {
        _me.startURL();
      } else {
        _me.setURLTimeout();
      }
    }

    startURL() {
      AKIT.aloggerKitURL('anode: (media.agent-startmedia):' + this.id + ' ' + this.URL);

      if (this.URLMediaready == false) {
        this.URLMediaready = true;
        this.parent.startURLMedia();
      }
    }

    setURLTimeout() {
      this.URLTimeoutCount++;
      this.URLTimer = Date.now();
      AKIT.aloggerKitURL('anode: (media.agent-timer):' + this.id + ' ' + this.URLTimeoutCount);

      if (this.URLTimeoutCount > 3) {
        this.URLTimeoutCount = 0;
        this.URLTimer = 0;
        this.parent.failURLMedia();
      }
    }

    checkURLTimeout() {
      const elapsed = Date.now() - this.URLTimer;

      if (elapsed > this.URLTimeout) {
        this.URLTimer = 0;
        AKIT.aloggerKitURL('anode: (media.agent-timeout):' + this.id + ' ' + elapsed);
        return true;
      }

      return false;
    }

    fileExistsCall(url, index, callback) {
      if (url == '') {
        callback(false, index);
      } else {
        var http = new XMLHttpRequest();

        http.onreadystatechange = function () {
          if (http.readyState == 4) {
            AKIT.aloggerKitURL('autil: (exists-call):' + url + ' ' + ' ' + http.readyState + ' ' + http.status);

            if (http.status == 200 || http.status == 206) {
              callback(true, index);
            } else {
              callback(false, index);
            }
          }
        };

        http.open('GET', url, true);
        http.send(null);
      }

      AKIT.aloggerKitURL('autil: (exists):' + url + ' ' + http.status);
    }

    fileExistsCallback(status, obj) {
      //  var nobj = anetSystem.nodes[id];
      AKIT.aloggerKitURL('autil: (exists-callback):' + obj + ' ' + status); //  if (nobj != undefined) {

      obj.checkURLCallback(status); //  }
    }

    fileExists(url) {
      var http = new XMLHttpRequest();
      http.open('HEAD', url, false);
      http.send(null);
      AKIT.aloggerKitURL('autil: (exists-test):' + url + ' ' + http.status);

      if (http.status == 404) {
        AKIT.aloggerKitURL('autil: (exists-nup):' + url + ' ' + ' ' + http.readyState + ' ' + http.status);
        return false;
      }

      AKIT.aloggerKitURL('autil: (exists-yep):' + url + ' ' + ' ' + http.readyState + ' ' + http.status);
      return true;
    }

  }

  class AKIT_ObjectVideoURL extends AKIT_ObjectVideo {
    constructor(videoSrc, videoImg, imageWidth, imageHeight) {
      super(videoSrc, videoImg, imageWidth, imageHeight);
      this.properties['videoSrc'] = videoSrc;
      this.loader();
    }

    loader() {
      const c = new AKIT_ObjectPropertyURLLoader(this, this.properties.videoSrc);
      this.addChild('loader', c);
    }

    reloader(videoSrc) {
      this.properties.videoSrc = videoSrc;
      this.child.loader.init(videoSrc);
    }

    checkVideoURLReady() {
      if (this.videoUpdatedCheck()) return true;
      this.child.loader.checkURLReady();
    }

    updateVideoTimeout() {
      //  if (this.object != undefined) {
      if (this.properties.video.videoReady == -1) {
        //  alogAppObj("amedia: (media.agent-reload-error) " + this.name);
        this.properties.video.videoReload();
      } //    }

    }

  }

  class AKIT_ObjectVideoGroupMaster extends AKIT_ObjectVideoURL {
    constructor(videoSrc, videoImg, imageWidth, imageHeight, type) {
      super(videoSrc, videoImg, imageWidth, imageHeight);
      this.properties['videoSrc'] = videoSrc;
      this.properties['videoImg'] = videoImg;
      this.properties['lengthWidth'] = imageWidth;
      this.properties['lengthHeight'] = imageHeight;
      this.videoInit();
    }

    check() {
      if (this.checkVideoURLReady()) {
        this.setVideoReady();
        return true;
      }

      return false;
    }

    setVideoReady() {
      AKIT.video.setLoadNotify(this.properties.videoSrc);
    }

    setVideoLoad() {
      //   console.log('loading', this.properties.videoSrc);
      this.videoEvents();
      this.videoLoad();
    } ////////////////////////////////////////////////////////////////////////////


    setURLMedia() {
      AKIT.video.addLoadQueue(this.properties.videoSrc);
    }

    checkURLMedia() {
      return true;
    }

    startURLMedia() {}

    failURLMedia() {}

    getRenderId() {//return this.child.effect.getVideoRenderId();
    }

  }

  const top = 0;

  const parent = i => (i + 1 >>> 1) - 1;

  const left = i => (i << 1) + 1;

  const right = i => i + 1 << 1;

  class AKIT_AppPriority {
    constructor(comparator = (a, b) => a > b) {
      this._heap = [];
      this._comparator = comparator;
    }

    size() {
      return this._heap.length;
    }

    isEmpty() {
      return this.size() == 0;
    }

    isActive() {
      return this.size() > 0;
    }

    peek() {
      return this._heap[top];
    }

    push(...values) {
      values.forEach(value => {
        this._heap.push(value);

        this._siftUp();
      });
      return this.size();
    }

    pop() {
      const poppedValue = this.peek();
      const bottom = this.size() - 1;

      if (bottom > top) {
        this._swap(top, bottom);
      }

      this._heap.pop();

      this._siftDown();

      return poppedValue;
    }

    replace(value) {
      const replacedValue = this.peek();
      this._heap[top] = value;

      this._siftDown();

      return replacedValue;
    }

    _greater(i, j) {
      return this._comparator(this._heap[i], this._heap[j]);
    }

    _swap(i, j) {
      [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }

    _siftUp() {
      let node = this.size() - 1;

      while (node > top && this._greater(node, parent(node))) {
        this._swap(node, parent(node));

        node = parent(node);
      }
    }

    _siftDown() {
      let node = top;

      while (left(node) < this.size() && this._greater(left(node), node) || right(node) < this.size() && this._greater(right(node), node)) {
        let maxChild = right(node) < this.size() && this._greater(right(node), left(node)) ? right(node) : left(node);

        this._swap(node, maxChild);

        node = maxChild;
      }
    }

  }

  class AKIT_AppVideo {
    constructor() {
      this.videoList = {}; //   this.videoQueue = {};

      this.videoPairwiseQueue = new AKIT_AppPriority((a, b) => a[1] > b[1]);
      this.videoLoadList = [];
      this.numberOfLoads = 1;
      this.focus = 0;
    }

    cycle() {
      this.updateLoadQueue();
    }

    registerVideo(name, imageWidth, imageHeight) {
      if (this.videoList[name] == undefined) this.videoList[name] = new AKIT_ObjectVideoGroupMaster(name, '', imageWidth, imageHeight);
    }

    checkVideo(name) {
      if (this.videoList[name].check()) return true;
      return false;
    }

    getVideo(name) {
      return this.videoList[name].properties;
    }

    addLoadQueue(name) {
      //    console.log("addLoadQueue",name)
      var p = Date.now();
      this.videoList[name].priority = p;
      this.videoPairwiseQueue.push([name, -p]); //this.videoQueue[p] = name;
      //  console.log('queue',name,p);
    }

    updateLoadQueue() {
      if (this.videoLoadList.length < this.numberOfLoads) {
        if (this.videoPairwiseQueue.isActive()) this.addLoadingList(this.videoPairwiseQueue.pop()[0]);
      }
    }

    setLoadNotify(name) {
      this.delLoadingList(name);
    }

    addLoadingList(name) {
      if (this.videoLoadList[name] == undefined) {
        //   console.log('loadlist', name);
        this.videoLoadList.push(name);
        this.videoList[name].setVideoLoad(name);
      }
    }

    delLoadingList(name) {
      let i = this.videoLoadList.indexOf(name);
      this.videoLoadList.remove(i);
    }

    setVideoFocus() {} // userEvent() {
    // console.log('video usere', this.focus.properties.video)
    //   if (this.focus!=0)
    //     this.focus.properties.video.play();
    //}


  }

  class AKIT_ObjectFileOBJ extends AKIT_Object {
    constructor(name, path, scale) {
      super();
      this.id_geometry = 'objFile_' + path + '_' + name;
      this.setType('objectFile', 'objectFile'); // this.properties['parent'] = parent;

      this.properties['name'] = name;
      this.properties['path'] = path;
      this.properties['scale'] = scale; // this.properties['mesh'] = undefined;
    }

    init() {
      this.loader(this.properties.name, this.properties.path);
    }

    promise() {
      let _me = this;

      var obj = this.properties.name + '.obj';
      var mtl = this.properties.name + '.mtl';
      var path = this.properties.path;
      let p = new Promise(resolve => {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setTexturePath(path);
        mtlLoader.setPath(path);
        mtlLoader.load(mtl, function (materials) {
          materials.preload();
          var objLoader = new THREE.OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.setPath(path);
          objLoader.load(obj, function (object) {
            _me.loaded(object);

            resolve(object);
          });
        });
      }); // AKIT.promise.add('name', p);

      this.promiseSet(p);
    }

    promiseSet(p) {

      let pl = [];
      p.then(function (val) {
        //  _me.progress(++_me.count);
        return val;
      });
      pl.push(p);
      Promise.all(pl).then(values => {//  console.log(values);
      });
    }

    loader(name, path) {
      let _me = this;

      var obj = name + '.obj';
      var mtl = name + '.mtl';
      console.log('load', obj, mtl, path);
      var mtlLoader = new THREE.MTLLoader(); //mtlLoader.setTexturePath(path);

      mtlLoader.setResourcePath(path);
      mtlLoader.setPath(path);
      mtlLoader.load(mtl, function (materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(path);
        objLoader.load(obj, function (object) {
          _me.loaded(object);
        });
      });
    }

    loaded(mesh) {
      // this.properties.mesh = mesh;
      ///  this.object=mesh
      ///this.updateScale(this.properties.scale)
      //  this.add();
      //  console.log('loaded',this.id_geometry,this.object.children[0].id)
      //    this.object.children[0].visible=false

      /*  let geometry = this.object.children[0].geometry
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
        geometry.normalsNeedUpdate = true;
        geometry.verticesNeedUpdate = true;*/
      //console.log('loaded', mesh);
      this.call('loaded', mesh);
    }

  }

  class AKIT_ObjectFileGLTF extends AKIT_Object {
    constructor(name, path, scale) {
      super();
      this.id_geometry = 'gltfFile_' + path + '_' + name;
      this.setType('gltfFile', 'gltfFile');
      this.properties['name'] = name;
      this.properties['path'] = path;
      this.properties['scale'] = scale; //console.log(this)
    }

    promise() {
      this.init();
    }

    init() {
      this.loader(this.properties.name, this.properties.path);
    }

    loader(name, path) {
      let _me = this;

      var obj = path + name + '.gltf';
      console.log('load', obj, path);
      var loader = new THREE.GLTFLoader();
      loader.load(obj, function (gltf) {
        gltf.scene.traverse(function (child) {
          if (child.isMesh) {
            _me.loaded(child);
          }
        });
      });
    }

    loaded(mesh) {
      console.log(mesh);
      this.call('loaded', mesh);
    }

  }

  class AKIT_ObjectARTypeFile$1 extends AKIT_ObjectARType {
    constructor(type, name, filename, dir, scale, data) {
      super();
      this.properties['data'] = data;
      this.properties['type'] = type;
      this.properties['name'] = name;
      this.properties['filename'] = filename;
      this.properties['dir'] = dir;
      this.properties['artype'] = 'obj';
      this.properties['scale'] = scale;
    }

    init() {
      this.type();
      this.properties.object.promise();
    }

    type() {
      if (this.properties.type == 'obj') this.typeObj(this.properties.name, this.properties.filename, this.properties.dir);else if (this.properties.type == 'gltf') this.typeGLTF(this.properties.name, this.properties.filename, this.properties.dir);
    }

    typeObj(name, filename, dir, scale) {
      this.properties['object'] = new AKIT_ObjectFileOBJ(name, dir);
      this.properties.object.caller(this);
    }

    typeGLTF(name, filename, dir, scale) {
      this.properties['object'] = new AKIT_ObjectFileGLTF(name, dir);
      this.properties.object.caller(this);
    }

    call(e, obj) {
      // console.log('call', obj);
      //if (obj.isPrototypeOf(Mesh))
      this.object = obj;
      this.set(); //this.object = obj.children[0];
      // this.updateScale(100);
      //  this.updateScale(this.properties.scale);
      //  this.markerInActive();
    }

  }

  class AKIT_ObjectShaderVignetteColor {
    constructor(texture) {
      this.properties = {};
      this.init(texture);
    }

    init(texture) {
      this.properties['color'] = 0xffffff;
      this.properties['fragmentShaderUniform'] = this.uniform(texture);
      this.properties['fragmentShader'] = this.fragmentShader();
    }

    uniform(texture) {
      const fragmentShaderUniform = {
        uTexture: {
          type: 't',
          value: texture
        },
        uColor: {
          type: 'c',
          value: new THREE.Color(this.properties.color)
        },
        customValue: {
          type: 'f',
          value: 0.5
        }
      };
      return fragmentShaderUniform;
    }

    fragmentShader() {
      const fragmentShader = {
        vertex: ['varying vec2 vTexCoord;', 'void main(void) {', 'vTexCoord = uv;', 'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );', 'gl_Position = projectionMatrix * mvPosition;', '}\n'].join('\n'),
        fragment: ['uniform sampler2D uTexture;', 'uniform vec3 uColor;', 'uniform vec2 resolution;', 'varying vec2 vTexCoord;', 'void main(void) {', 'vec4 texColor = texture2D(uTexture, vTexCoord);', 'float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));', //grayscale
        'vec3 imgColor = vec3(gray) * uColor;', 'texColor.rgb = mix(texColor.rgb, imgColor, 0.9);', //////////////////////////////////////////////////////////////////////////////////////////////
        //vignette
        'float aspect = 3.0/3.0;', 'float scale = 0.6;', 'float offset = 0.0;', 'float smoothingX = -0.4;', //-0.4
        'float smoothingY = 0.8;', // 0.8
        'vec2 pos = vTexCoord;', 'pos -= 0.5;', 'pos.x *= aspect;', 'pos /= scale;', 'pos -= offset;', 'float dist = length(pos);', 'dist = smoothstep(smoothingX, smoothingY, 1.-dist);', ' vec3 color2 = vec3(0.0,0.0,0.0);', 'vec3 color = mix(color2, texColor.rgb, dist);', //////////////////////////////////////////////////////////////////////////////////////////////
        //////luma
        'float threshold;', 'float clipBlack=0.4;', //0.5
        'float clipWhite=0.1;', //1.0
        'const vec3 lumcoeff = vec3(0.2125,0.7154,0.0721);', 'float luma = dot(color,lumcoeff);', 'float alpha = 1.0 - smoothstep(clipBlack, clipWhite, luma);', 'gl_FragColor = vec4(color, min(1.0, alpha) );', //////////////////////////////////////////////////////////////////////////////////////////////
        //////addcolour
        //     'float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));',  //grayscale
        //     'vec3 imgColor = vec3(gray) * customColor;',
        //     'texColor.rgb = mix(texColor.rgb, imgColor, 0.9);',
        //   'gl_FragColor = vec4(color, 1.0);',
        '}'].join('\n')
      };
      return fragmentShader;
    }

  } //   'vec2 position = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y) - vec2(0.5);',
  //  'float len = length(position);',
  //  'float vignette = smoothstep(RADIUS, RADIUS-SOFTNESS, len);',
  //   'texColor.rgb = mix(texColor.rgb, texColor.rgb * vignette, 0.5);',
  //    'texColor.rgb = texColor.rgb * 0.9;',
  // 'gl_FragColor = vec4(texColor.rgb, 1.0);',
  // 'float aspect = 512.0/ 512.0;',
  //       'vec2 p = gl_FragCoord.xy / resolution.xy;',
  //     'float darkness = 1.45;',
  //   'vec2 textureCoords = p - 0.5;',
  //     'float vignette = 1.0 - (dot(textureCoords, textureCoords) * darkness);',
  //   'gl_FragColor= vec4(vignette, vignette, vignette, 1.0-vignette);',
  //  'vec2 position = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y) - vec2(0.5);',   //
  //   'gl_FragColor = vec4(texColor.rgb, 0.2);',
  //  'gl_FragColor = texColor;',
  //  'float vignette = 20.0;',
  //  'float len = 0.5;',
  //  'gl_FragColor = vec4( vec3(len), 1 );',
  // 'gl_FragColor = texColor;',// * vColor;',

  /*         'precision mediump float;',

               'varying vec2 vTexCoord;',


                 'varying vec2 vUv;',

                'uniform sampler2D customTexture;',
                'uniform float customValue;',

                'void main(void) {',
                 //   'gl_FragColor = texture2D(customTexture, vUv);',

                '	vec4 pixel = texture2D(customTexture, vUv);',
                '	vec2 pos = vUv.xy - 0.5;',
                '	float vignette = 1.0 - (dot(pos, pos) * customValue);',
                '	gl_FragColor = vec4(pixel.rgb * vignette, pixel.a);',*/
  // first convert to screen space
  //   '	vec4 screenPosition = vec4(position.xy * resolution / 2.0, position.z, position.w);',
  //   '	screenPosition = transform * screenPosition;',
  // convert back to OpenGL coords
  //   '	gl_Position.xy = screenPosition.xy * 2.0 / resolution;',
  //   '	gl_Position.z = screenPosition.z * 2.0 / (resolution.x / resolution.y);',
  //   '	gl_Position.w = screenPosition.w;',
  //    'vTexCoord = texCoord;',
  //    'precision mediump float;',
  //    'attribute vec4 position;',
  //      'uniform vec2 resolution;',
  //      'uniform mat4 transform;',
  //     'attribute vec4 Color;',
  //     'varying vec4 vColor;',

  class AKIT_ObjectEffectVignetteColor extends AKIT_Object {
    constructor(img) {
      super();
      this.init(img);
    }

    init(img) {
      this.texture(img);
      this.shader();
      this.material(); // this.addChild('material',new AKIT_ObjectMaterialWire());
    }

    getMaterial() {
      return this.child.material.properties.material;
    }

    setTexture(img) {
      this.child.texture.update(img);
    } /////////////////////////////////////////////////////


    texture(img) {
      this.addChild('texture', new AKIT_ObjectTextureImage(img));
    }

    shader() {
      this.addChild('shader', new AKIT_ObjectShaderVignetteColor(this.child.texture.properties.texture));
    }

    material() {
      const p1 = this.child.shader.properties['fragmentShaderUniform'];
      const p2 = this.child.shader.properties['fragmentShader'];
      this.addChild('material', new AKIT_ObjectMaterialShader(p1, p2));
    }

  }

  class AKIT_ObjectTypePlaneVideoEffectVignette extends AKIT_ObjectType {
    constructor(planeX, planeY, imageWidth, imageHeight, hostName, videoSrc, debug) {
      super();
      this.properties['planeX'] = planeX;
      this.properties['planeY'] = planeY;
      this.properties['scale'] = 1.0;
      this.properties['imageHeight'] = imageHeight;
      this.properties['imageWidth'] = imageWidth;
      this.properties['hostName'] = hostName;
      this.properties['videoSrc'] = videoSrc;
      this.properties['debug'] = debug;
      this.setType('planeVideo', 'planeVideo-' + planeX + '_' + planeY);
      this.init();
    }

    init() {
      this.video();
      this.material();
      this.geometry();
      this.mesh();
    } /////////////////////////////////////////////////////


    video() {
      const c = new AKIT_ObjectVideoEffectURL(this.properties.videoSrc, '', this.properties.imageWidth, this.properties.imageHeight);
      this.addChild('video', c);
    }

    material() {
      if (this.properties.debug) this.addChild('material', new AKIT_ObjectMaterialWire());else this.addChild('material', new AKIT_ObjectEffectVignetteColor(this.video.properties.canvas));
    }

    geometry() {
      this.properties['geometry'] = new THREE.PlaneBufferGeometry(this.properties.imageWidth, this.properties.imageHeight, this.properties.planeX, this.properties.planeY);
    }

    mesh() {
      this.meshObject(this.properties.geometry, this.child.material.properties.material);
      this.properties.geometry.dynamic = true;
      this.meshObjectUpdateAll();
    }

    playVideo() {
      this.child.video.setMediaCurrentTime(0);
    }

    stopVideo() {
      this.child.video.resetMediaCurrentTime();
    }

    updateVideo() {}

    initVideo() {
      const videoSrc = this.getVideoSrc();
      const posterSrc = this.getPosterSrc();
      let imageWidth = ANET.clothMediaLengthW;
      let imageHeight = ANET.clothMediaLengthH;
      this.video = new AKIT_ObjectVideoGroup(videoSrc, posterSrc, imageWidth, imageHeight);
      this.initVideoMaterial();
    }

    initVideoMaterial(canvas) {
      let imageWidth = this.mediaInsideX;
      let imageHeight = this.mediaInsideY;
      this.material = new AKIT_ObjectEffectVignetteColor(this.video.properties.canvas);
    }

    setVideoMaterial() {
      this.material.setTexture(this.video.properties.video);
    }

    loadVideo() {}

    reinitVideo(videoSrc) {
      this.video.reloader(videoSrc);
      this.video.videoReinit(videoSrc);
    }

    getVideoSrc() {
      return 'http://' + this.properties.host + '/' + this.properties.filename + '.webm';
    }

    getPosterSrc() {
      return 'http://' + this.properties.host + '/' + this.properties.filename + '.png';
    }

  }

  class AKIT_ObjectARTypeVideo extends AKIT_ObjectType {
    constructor(planeX, planeY, imageWidth, imageHeight, videoSrc, debug) {
      super();
      this.properties['planeX'] = planeX;
      this.properties['planeY'] = planeY;
      this.properties['scale'] = 1.0;
      this.properties['imageHeight'] = imageHeight;
      this.properties['imageWidth'] = imageWidth;
      this.properties['videoSrc'] = videoSrc;
      this.properties['debug'] = debug;
    }

    init() {
      this.video();
    }

    video() {
      this.properties['video'] = new AKIT_ObjectTypePlaneVideoEffectVignette(this.properties.planeX, this.properties.planeY, this.properties.scale, this.properties.imageHeight, this.properties.imageWidth, this.properties.videoSrc, this.properties.debug); // this.properties.object.caller(this);
      // this.properties.object.init();
    }

    call(e, obj) {
      // console.log(e,obj,obj.children)
      //if (obj.isPrototypeOf(Mesh))
      //this.object = obj;
      this.object = obj.children[0];
      this.updateScale(this.properties.scale); //  this.markerInActive();
    }

  }
  /*
    material(canvas) {
      let imageWidth = this.mediaInsideX;
      let imageHeight = this.mediaInsideY;
      this.material = new AKIT_ObjectEffectVignetteColor(this.video.properties.canvas);
    }

    setVideoMaterial() {
      this.material.setTexture(this.video.properties.video);
    }
  */

  /*    const videoSrc = this.getVideoSrc();
      const posterSrc = this.getPosterSrc();
      let imageWidth = ANET.clothMediaLengthW;
      let imageHeight = ANET.clothMediaLengthH;
      this.video = new AKIT_ObjectVideoGroup(videoSrc, posterSrc, imageWidth, imageHeight);
      this.initVideoMaterial();*/

  class AKIT_ObjectARTypeObject extends AKIT_ObjectARType {
    constructor(name, obj) {
      super();
      this.properties['name'] = name;
      this.object = obj;
    }

    init(obj) {//  console.log(this)
    }

  }

  class AKIT_ARAppObjects {
    constructor(parent) {
      this.parent = parent; // this.lang = APP.language;

      this.loaderObjID = [];
      this.groupSelect = -1;
    } ////////////////////////////////////////////////////////////objects


    init() {
      this.objects = [];
      this.objectsData = [];
      this.objectsGroup = {};
      this.objectsGroupId = {};
      this.objectsLoaded = [];
    }

    log() {//console.log(this.objects);
      // console.log('log')
    }

    load(objectList) {

      for (let i = 0; i < objectList.length; i++) {
        let olist = objectList[i];
        let obj = this.objectLoad(olist);
        this.objectsLoaded.push(obj.id); //  console.log(this.objectsLoaded.length,obj.id)
      }
    }

    loadObj(olist) {
      let obj = this.objectLoad(olist);
      this.objectsLoaded.push(obj.id);
    }

    loadAnchor(olist) {
      let obj = this.objectLoad(olist);
      this.objectsLoaded.push(obj.id);
    }

    objectsLoad(id) {
      if (this.loaderObjID.indexOf(id) != -1) return false;
      this.loaderObjID.push(id);
      return true;
    }

    objectsLoadAgain(id) {
      let i = this.loaderObjID.indexOf(id);
      this.loaderObjID.remove(i);
    }

    objectLoadSet(obj) {
      var i = this.objectsLoaded.indexOf(obj.id);

      if (i != -1) {
        this.objectsLoaded.remove(i);
        obj.init(); //   console.log('loaded',obj.id,JSON.stringify(this.objectsLoaded));
      }
    }

    objectLoad(olist) {
      let pdata = this.objectProfile(olist.filetype);
      let objUrl, obj, objFileName;

      if (pdata != undefined) {
        if (pdata.location == 'file') objUrl = this.objectFileURL(olist.name, olist.dir, olist.group, olist.filetype);
        objFileName = this.objectFileName(olist.name, olist.filetype, pdata.extension);
        obj = this.objectType(olist, pdata, objFileName, objUrl);
        this.objectProperties(obj, pdata);
      } else {
        objFileName = "";
        olist.filetype = "";
        obj = this.objectTypeObject(olist);
      }

      this.objects.push(obj);
      let objId = this.objects.length - 1;
      let mid = this.objectLoadGroupId(olist.marker); //this.parent.markerIds[olist.marker];

      this.objectGroupAdd(olist.group, mid, objId);
      let objData = this.objectData(olist);
      this.objectsData.push(objData);
      AKIT.alogAppA('(object) ' + olist.name + ' ' + olist.group + ' ' + olist.filetype + ' filename:' + objFileName + '  marker:' + mid + ' ' + olist.marker + ' ' + objUrl);
      return obj;
    }

    objectLoadGroupId(omarker) {
      let gid = parseInt(omarker) - 1;
      if (this.parent.markerIds != undefined) gid = this.parent.markerIds[omarker];
      return gid;
    }

    objectProperties(obj, olist) {
      let oscale = olist.scale;
      let orot = olist.rotate;
      var data = {
        scale: oscale,
        rotate: orot
      };
      obj.settings(data); //

      let ll = olist.loader;
      obj.loaderSet(ll);
      let control = olist['control'];
      if (control != undefined) obj.control();
    }

    objectProfile(name) {
      const profileList = APP.properties;
      return profileList[name];
    }

    objectData(olist) {
      return this.parent.objectData(olist);
    }

    objectType(olist, plist, objFileName, objUrl) {
      let obj;
      let filetype = olist.filetype;

      if (filetype == 'videoNormal') {
        obj = new AKIT_ObjectARTypeVideo(olist.filetype, olist.name, objFileName, objUrl, plist.scale);
      } else if (filetype == 'video') {
        obj = this.objectPreloadVideo(objUrl, objFileName);
      } else if (filetype == 'obj' || filetype == 'gltf') {
        obj = new AKIT_ObjectARTypeFile$1(olist.filetype, olist.name, objFileName, objUrl, plist.scale); //obj.init(); // or promise
        //  obj.promise(); // or promise
      }

      return obj;
    }

    objectTypeObject(olist) {
      let obj = new AKIT_ObjectARTypeObject(olist.name, olist.object);
      return obj;
    }

    objectFileURL(name, dir, group, filetype) {
      return APP.host + APP.objDir + group + '/' + dir + '/'; //APP.host +
    }

    objectFileName(name, filetype, fileext) {
      if (filetype == 'video') {
        return name + '.' + fileext;
      }

      return name + '.' + filetype;
    }

    objectGroupAdd(grp, gid, idx) {
      let group = this.objectsGroup[grp];
      if (group == undefined) group = [];
      group.push(idx);
      this.objectsGroup[grp] = group; //

      let groupid = this.objectsGroupId[gid];
      if (groupid == undefined) this.objectsGroupId[gid] = grp; //console.log(grp, gid, idx);
      // console.log(this.objectsGroup,this.objectsGroupId);
    }

    objectGet(groupId, groupCode) {
      if (groupId != this.groupSelect) {
        if (!this.objectGroupSet(groupId)) {
          window.APP.run.parent.objects(groupId, groupCode); //  console.log('objects' );

          return false;
        }

        this.groupSelect = groupId;
      }

      let oid = this.objectsGroupSelect[this.objectSelect];
      let obj = this.objects[oid];
      this.objectLoadSet(obj);
      return obj;
    }

    objectPromise(p) {

      let pl = [];
      p.then(function (val) {
        //  _me.progress(++_me.count);
        return val;
      });
      pl.push(p);
      Promise.all(pl).then(values => {
        console.log(values);
      });
    } /////////////////////////////////////////////////////////


    objectIndexSet(index) {
      //console.log(index,this.objectsGroupSelect);
      if (index < this.objectsGroupSelect.length) {
        this.objectSelect = index;
      }
    }

    objectIndexGet() {
      return this.objectSelect;
    }

    objectIndexFade() {
      let obj = this.objects[this.objectSelect];
    } // 0 0.8801993743028066 false -1 0


    objectGroupSet(markerId) {
      this.objectSelect = 0;
      let grp = this.objectsGroupId[markerId];
      console.log(grp, markerId, this.objectsGroupId);

      if (grp != undefined) {
        this.objectsGroupSelect = this.objectsGroup[grp];
        this.objectGroupDataSet();
        return true;
      }

      return false;
    }

    objectGroupDataSet() {
      this.objectsGroupSelectData = [];

      for (let i = 0; i < this.objectsGroupSelect.length; i++) {
        let oid = this.objectsGroupSelect[i];
        let odata = this.objectsData[oid];
        this.objectsGroupSelectData.push(odata);
      } //console.log(APP.run.parent);


      APP.run.parent.call('objectGroup', this.objectsGroupSelectData); // console.log('datagrp', this.objectsGroupSelectData);
    }

    objectGroupData() {
      if (this.objectsGroupSelect != -1) {
        return this.objectsGroupSelectData;
      }
    }

    objectPreloadVideo(objUrl, objFileName) {
      let obj;
      var planeX = APP.video.width;
      var planeY = APP.video.height;
      var imageWidth = APP.video.imageWidth;
      var imageHeight = APP.video.imageHeight;
      var hostName = objUrl;
      var videoSrc = objUrl + objFileName;
      var debug = false;
      obj = AKIT.store.get('ARTypePlaneVideoEffectVignette');

      if (obj == undefined) {
        obj = new AKIT_ObjectARTypePlaneVideoEffectVignette(planeX, planeY, imageWidth, imageHeight, hostName, videoSrc, debug);
      } else {
        obj.reconstruct(planeX, planeY, imageWidth, imageHeight, hostName, videoSrc, debug);
      }

      return obj;
    }

  }
  /* objectOptions(obj,olist) {
    let sc = olist.scale;
    if (sc!=undefined ) {
     // obj.updateScale(sc)
    }
  }*/

  /* let obj;
  if (olist.filetype == 'video') {
    obj = new AKIT_ObjectARTypeVideo(olist.filetype, olist.name, objFileName, objUrl, olist.scale);
  } else obj = new AKIT_ObjectARTypeFile(olist.filetype, olist.name, objFileName, objUrl, olist.scale);*/

  /*


    objectInit1(obj, olist) {

      let oscale = olist.scale;
      console.log(obj)
      obj.updateScale(oscale);

      let orot = olist.rotate;
      if (orot != undefined) {
        obj.rotationXYZ(orot.x * Math.PI, orot.y * Math.PI, orot.z * Math.PI);
      }

      obj.meshObjectUpdateAll();
    }
   */
  /////////
  // if (this.markerIds != undefined) {
  //   let mid = this.markerIds[olist.marker];
  //   if (this.markerMgr.objects[mid] == undefined) this.markerMgr.objects[mid] = [];
  //   this.markerMgr.objects[mid].push(objId);
  // this.item.meshObjectUpdateAll();
  //console.log(this.markerMgr.objects[mid], mid);

  /*loadAll(objectList) {
    //const objectList = APP.objects;
      AKIT.promise.start('objectar');
    let i = 0;
    for (let i = 0; i < objectList.length; i++) {
      let olist = objectList[i];
      this.objectLoad(olist);
    }
      AKIT.promise.set('objectar');
      //console.log(this.objectsData,this.objectsGroup,this.objectsGroupId);
  }*/

  class AKIT_WebXR {
    constructor() {
      this.properties = {}; //   this.properties['sourceType'] = sourceType;
    }

    init() {
      THREE.WebXRUtils.getDisplays().then(this.startXR);
    }

    startXR(displays) {
      console.log('webXR start', displays);
      var options = {
        // Flag to start AR if is the unique display available.
        AR_AUTOSTART: true
      };
      APP.renderer.xr = new THREE.WebXRManager(options, displays, APP.renderer, AKIT.scene.camera, AKIT.scene, AKIT.sceneAR.frameXR);
      APP.renderer.xr.addEventListener('sessionStarted', AKIT.sceneAR.sessionXR);
    }

    sessionXR() {
      console.log('webXR session');
      let realityType = data.session.realityType;
      console.log(realityType);
    }

    frameXR(frame) {
      console.log('webXR frame', frame);
    }

    frame() {}

  }

  class AKIT_Web3AR {
    constructor() {
      this.properties = {}; //   this.properties['sourceType'] = sourceType;
    }

    init() {
      console.log('web3AR init');
      THREE.ARUtils.getARDisplay().then(function (display) {
        if (display) {
          AKIT.sceneAR.start(display);
        } else {
          THREE.ARUtils.displayUnsupportedMessage();
        }
      });
    }

    start(display) {
      this.display = display;
      console.log('web3AR start', display);
      this.arview = new THREE.ARView(this.display, APP.renderer);
      this.camera = new THREE.ARPerspectiveCamera(this.display, 60, window.innerWidth / window.innerHeight, this.display.depthNear, this.display.depthFar);
      this.vrcontrols = new THREE.VRControls(this.camera);
    }

    render() {
      //run before scene render
      APP.renderer.clearColor();
      this.arview.render();
      this.camera.updateProjectionMatrix();
      this.vrcontrols.update();
      APP.renderer.clearDepth();
    }

    frame() {}

  }

  class AKIT_SceneInjected {
    constructor(options, scene, renderer, camera) {
      this.SCREEN_WIDTH = window.innerWidth;
      this.SCREEN_HEIGHT = window.innerHeight;
      this.VIEW_ANGLE = APP.cameraDistanceViewAngle;
      this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
      this.NEAR = APP.cameraDistanceNear;
      this.FAR = APP.cameraDistanceFar;
      this.RSIZE = 1; //1 / half=2

      this.sceneType = APP.sceneType;
      this.windowLoaded = false;

      if (AKIT.canvas == undefined || AKIT.canvas == 0) {
        AKIT.canvas = document.createElement('canvas');
      }

      this.scene = scene; //  this.scene.background = new THREE.Color( 0x505050 );

      this.effects = {};
      this.options = options;
      if (APP.displayStats) this.stats = new Stats();
      window.addEventListener('resize', this.onWindowResize, false);
      window.addEventListener('load', this.onWindowLoad, false);
      APP.renderer = renderer;
      this.camera = camera;
      console.log('scene injected:', AKIT.canvas);
    }

    init() {
      if (this.setStats) {
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 100;
        AKIT.container.appendChild(this.stats.domElement);
      }

      this.initLight();
    }

    reset() {}

    stats() {
      if (this.setStats) this.stats.update();
    }

    render() {//  APP.renderer.render(this.scene, this.camera);
    }

    renderer(rendererConfig) {
      let rendererOptions = rendererConfig; //APP.rendererOptions;

      console.log(rendererOptions); //    rendererOptions.antialias=true;
      //    APP.renderer = new THREE.WebGLRenderer(rendererOptions);

      return APP.renderer;
    }

    inworld(mesh) {
      if (this.scene.children.indexOf(mesh) == -1) return false;
      return true;
    }

    initLight() {
      this.light = new AKIT_SceneLight();
      this.light.init();
    }

    onWindowResize(e) {}

    onWindowLoad(e) {}

  }

  class AKIT_8Wall {
    constructor() {
      this.properties = {};
      this.properties.running = false;
      this.properties.started = false;
      this.points = [];
      this.pointsX = 10;
      this.pointsY = 10;
    }

    init() {}

    load() {
      ///ANET/canvas?
      if (AKIT.loadedAR) {
        if (!this.properties.running) {
          this.run();
          this.properties.running = true;
        } else if (this.properties.started) {
          this.start();
          return true;
        }
      }

      return false;
    }

    frame() {
      if (this.debug) this.pointsUpdate();
      this.pointsUpdateGroup();
    }

    resize() {
      var screenWidth = window.innerWidth;
      var screenHeight = window.innerHeight;
      AKIT.canvas.width = screenWidth;
      AKIT.canvas.height = screenHeight;
    }

    start() {
      this.resize();
      console.log('8Wall start');
      APP.run.started();
    }

    pointsUpdate() {
      var points = AKIT.sceneAR.points;
      var length = points.length;

      for (const key in points) {
        let pt = points[key];

        if (pt.confidence > 0.7) {
          console.log(key, pt.confidence, pt.position);
        }
      }
    }

    run() {
      console.log('8Wall run', AKIT.canvas); //   XR.XrController.configure({ enableWorldPoints: true });

      XR.addCameraPipelineModules([XR.GlTextureRenderer.pipelineModule(), // Draws the camera feed.
      XR.Threejs.pipelineModule(), // Creates a ThreeJS AR Scene.
      XR.XrController.pipelineModule(), // Enables SLAM tracking.
      {
        name: 'wall8app',
        //  onStart: () => {
        onStart: ({
          canvas,
          canvasWidth,
          canvasHeight
        }) => {
          const threeObj = XR.Threejs.xrScene(); //  APP.renderer = threeObj.renderer;

          console.log('3obj:', threeObj);
          AKIT.scene = new AKIT_SceneInjected({}, threeObj.scene, threeObj.renderer, threeObj.camera);
          AKIT.scene.init();
          this.control(); // turn on click to place
          //  AKIT.scene.scene = threeObj.scene;
          //  AKIT.scene.camera = threeObj.camera;

          console.log('8Wall set', APP.renderer, AKIT.scene, AKIT.canvas, this);
          XR.XrController.updateCameraProjectionMatrix({
            origin: AKIT.scene.camera.position,
            facing: AKIT.scene.camera.quaternion
          }); //  loadJS("/lib/js/aframe/8frame-0.9.0.js",document.body);
          //    loadJS("lib/js/aframe/akit-aframe-master-8wall.js",document.body);

          this.properties.started = true;
        }
        /*
            onUpdate: ({ processCpuResult }) => {
                if (!processCpuResult.reality) {
                  return;
                }
                 const { worldPoints } = processCpuResult.reality;
                 AKIT.sceneAR.points = worldPoints;
            //    console.log(worldPoints);
               //  1:
              //    confidence: 0.8888888955116272
              //      id: 3562826096
              //      position: {x: 0.09359163045883179, y: 1.490618109703064, z: -0.04243241995573044}
               }
        */

      }]); //    XR.run({ canvas: AKIT.canvas });

      this.running(); //    console.log('8Wall running', XR, AKIT.canvas);
    }

    running() {
      console.log('8Wall running0', XR, AKIT.canvas);
      XR.run({
        canvas: AKIT.canvas
      }); // XR.run({});

      console.log('8Wall running', XR, AKIT.canvas);
    } ////////////////////////////////


    control() {
      ////////////////////////////////////////////////place
      this.surface = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 8, 8), new THREE.MeshBasicMaterial({
        //    color: 0xffff00,
        transparent: true,
        opacity: 0.0,
        //  color: 0x000000,
        side: THREE.DoubleSide //  wireframe:true

      }));
      this.surface.rotateX(-Math.PI / 2);
      this.surface.position.set(0, 0, 0);
      AKIT.scene.scene.add(this.surface);
      AKIT.scene.scene.add(new THREE.AmbientLight(0x404040, 5)); // Add soft white light to the scene.

      AKIT.scene.camera.position.set(0, 2, 0);
      this.raycaster = new THREE.Raycaster();
      this.tapPosition = new THREE.Vector2();
      window.addEventListener('touchstart', this.controlHandlerPlace.bind(this), true); // Add touch listener.
    }

    controlHandlerPlace(e) {
      if (e.touches.length == 2) {
        XR.XrController.recenter();
      }

      if (e.touches.length > 2) {
        return;
      } // calculate tap position in normalized device coordinates (-1 to +1) for both components.


      this.tapPosition.x = e.touches[0].clientX / window.innerWidth * 2 - 1;
      this.tapPosition.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1; // Update the picking ray with the camera and tap position.

      this.raycaster.setFromCamera(this.tapPosition, AKIT.scene.camera); // Raycast against the "surface" object.

      const intersects = this.raycaster.intersectObject(this.surface);

      if (intersects.length == 1 && intersects[0].object == this.surface) {
        APP.run.app.eventHit(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
      }
    }

    controlHandlerHit(e) {
      //  console.log(e)
      let tapX = e.touches[0].clientX / window.innerWidth;
      let tapY = e.touches[0].clientY / window.innerHeight;
      let ht = this.hit(tapX, tapY);
      let h0 = ht[0]; //  alert(h0.position.x + " " + h0.position.y + " "  + h0.position.z)

      APP.run.app.eventHit(h0.position.x, h0.position.y, h0.position.z);
    }

    hit(x, y) {
      var ht = XR.XrController.hitTest(x, y); //, ['ESTIMATED_SURFACE'])
      //    console.log('hit',ht)

      return ht;
    } ////////////////////////////////////////////////////////////////////////////////////////////////


    pointsUpdateGroup() {
      var points = AKIT.sceneAR.points;
      var length = points.length;
      var pointsGrp = [];
      var heightDistance = 2;

      for (const key in points) {
        let pt = points[key];

        if (pt.confidence > this.confidence) {
          let ptx = pt.position.x;
          let pty = pt.position.y;
          let ptz = pt.position.z;
          let groupAdd = false;

          for (let i = 0; i < pointsGrp.length; i++) {
            let ptg = pointsGrp[i][0];
            let d = Math.abs(ptg.y - pty);

            if (d < heightDistance) {
              pointsGrp[i].push(new THREE.Vector3(ptx, pty, ptz));
              groupAdd = true;
            }
          }

          if (!groupAdd) {
            let ptGroup = [];
            ptGroup.push(new THREE.Vector3(ptx, pty, ptz));
            pointsGrp.push(ptGroup);
          }
        }
      } //////////////////////////////////////////////////////


      var selectY = 0;

      if (pointsGrp.length > 0) {
        var len = 0;
        var highGrp = -1;

        for (let i = 0; i < pointsGrp.length; i++) {
          if (pointsGrp[i].length > len) {
            highGrp = i;
          }
        }

        var selectGrp = pointsGrp[highGrp];
        selectY = selectGrp[0].y;
      } //  this.depthPos=selectY;
      //  console.log(selectY)


      this.surface.position.set(0, selectY, 0);
    } ////////////////////////////////////////////////////////////////////////////////////////////////////


    pointsUpdate() {
      //  var winnerW = window.innerWidth
      //  var winnerH = window.innerHeight
      var points = AKIT.sceneAR.points;
      var length = points.length;
      var i = 0;

      for (const key in points) {
        let pt = points[key];

        if (pt.confidence > 0.5) {
          if (this.debug) {
            if (this.debugObjs[i] == undefined) this.debugObjs[i] = new AKIT_ObjectTypeSphereDebug(.01, 4, 4);
            this.debugObjs[i].positionXYZ(pt.position.x, pt.position.y, pt.position.z);
            this.debugObjs[i].add();
            i++; //   console.log(i,pt.position.x, pt.position.y, pt.position.z);
          } //  console.log(key, pt.confidence, pt.position);

        }
      }
    }

  }

  class AKIT_ObjectARContext {
    constructor(parent, cameraParametersUrl, detectionMode) {
      //AKIT_ObjectVideo,
      this.parent = parent;
      this.properties = {};
      this.properties['cameraParametersUrl'] = cameraParametersUrl; //'/data/test/camera_para.dat',

      this.properties['detectionMode'] = detectionMode; //'mono'

      this.init();
    }

    init() {
      var arToolkitContext = new THREE.ArToolkitContext({
        cameraParametersUrl: this.properties.cameraParametersUrl,
        detectionMode: this.properties.detectionMode,
        canvasWidth: 80 * 3,
        canvasHeight: 60 * 3,
        maxDetectionRate: 30
      });

      var _this = this;

      arToolkitContext.init(function onCompleted() {
        // console.log('completed context');
        AKIT.scene.camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());

        _this.parent.contextReady();
      });
      this.properties['arcontext'] = arToolkitContext; //console.log(arToolkitContext)
    }

    update(domElement) {
      // if( arToolkitSource.ready === false )	return
      this.properties.arcontext.update(domElement);
    }

    stop() {
      //  this.properties.arcontext.arController.dispose();
      //  this.properties.arcontext.arController=null;
      console.log('stop context', this.properties.arcontext);
    }

  }

  class AKIT_ARJSToolkitSource {
    constructor(p, parameters) {

      this.parent = p;
      this.ready = false;
      this.domElement = null; // handle default parameters

      /*  this.parameters = {
        // type of source - ['webcam', 'image', 'video']
        sourceType: 'webcam',
        // url of the source - valid if sourceType = image|video
        sourceUrl: null,
         // Device id of the camera to use (optional)
        deviceId: null,
         // resolution of at which we initialize in the source image
        sourceWidth: 480, //640, 480
        sourceHeight: 640, //640, //480, //640
        // resolution displayed for the source
        displayWidth: 640,
        displayHeight: 480 //640
      };
      */
      //  console.log(parameters,APP.arjs.parameters)

      this.parameters = APP.mediaDevices.parameters; // this.setParameters(parameters);
    }

    setParameters(parameters) {
      if (parameters === undefined) return;

      for (var key in parameters) {
        var newValue = parameters[key];
        var currentValue = this.parameters[key];
        this.parameters[key] = newValue;
      }
    }

    init() {
      var domElement = this.initSourceWebcam();
      this.domElement = domElement;
      this.domElement.style.position = 'absolute';
      this.domElement.style.top = '0px';
      this.domElement.style.left = '0px';
      this.domElement.style.zIndex = '-2';
      this.ready = true; // return this;
    }

    reinit() {
      //  this.domElement = AKIT.devices.setDevice(this,this.parameters,this.domElement);
      this.setDeviceElement(); // this.parent.onResize();
    }

    setDeviceElement() {
      var _this = this;

      this.domElement.srcObject = AKIT.devices.mediaSrc; //   console.log(
      //     'setDeviceElement:' + AKIT.devices.mediaSrc,
      //     this.domElement,
      //    this.domElement.videoWidth
      //  );
      // to start the video, when it is possible to start it only on userevent. like in android

      document.body.addEventListener('click', function () {
        _this.domElement.play();
      }); // domElement.play();
      // TODO listen to loadedmetadata instead
      // wait until the video stream is ready

      /* var interval = setInterval(function () {
        if (!_this.domElement.videoWidth) {
          console.log('element')
          return;
        }
        clearInterval(interval);
      }, 1000 / 50);*/
    }

    initSourceWebcam() {
      var domElement = document.createElement('video'); // domElement.setAttribute('autoplay', '');

      domElement.setAttribute('muted', true); // domElement.setAttribute('playsinline', '');
      //// safari hacks

      domElement.setAttribute('autoplay', true);
      domElement.setAttribute('playsinline', true);
      domElement.setAttribute('controls', true);
      setTimeout(() => {
        domElement.removeAttribute('controls');
      });
      domElement.style.width = this.parameters.displayWidth + 'px';
      domElement.style.height = this.parameters.displayHeight + 'px'; ///this.checkDevice();
      //  domElement = this.setDevice(domElement);

      return domElement;
    }

    domElementWidth() {
      return parseInt(this.domElement.style.width);
    }

    domElementHeight() {
      return parseInt(this.domElement.style.height);
    } /////////////////////////////////////////////////////////////////////////////


    onResizeElement() {

      var screenWidth = window.innerWidth; // window.innerWidth; //window.innerWidth; //window.innerWidth;

      var screenHeight = window.innerHeight; //window.innerHeight; // //window.innerHeight;

      var sourceWidth = this.domElement.videoWidth;
      var sourceHeight = this.domElement.videoHeight; //  AKIT.canvas.height=screenHeight;
      //  AKIT.canvas.width=screenWidth;
      //  var sourceWidth = this.domElement.videoWidth;
      //  var sourceHeight = this.domElement.videoHeight;
      //  var sourceWidth = 480; //this.domElement.videoWidth;
      //  var sourceHeight = 640; // this.domElement.videoHeight;
      // compute sourceAspect

      var sourceAspect = sourceWidth / sourceHeight; // compute screenAspect

      var screenAspect = screenWidth / screenHeight; // if screenAspect < sourceAspect, then change the width, else change the height

      if (screenAspect < sourceAspect) {
        // compute newWidth and set .width/.marginLeft
        var newWidth = sourceAspect * screenHeight;
        this.domElement.style.width = newWidth + 'px';
        this.domElement.style.marginLeft = -(newWidth - screenWidth) / 2 + 'px'; // init style.height/.marginTop to normal value

        this.domElement.style.height = screenHeight + 'px';
        this.domElement.style.marginTop = '0px'; //  console.log(AKIT.canvas.height,AKIT.canvas.width);
        //  AKIT.canvas.height=screenHeight;
        //    AKIT.canvas.width=newWidth;
      } else {
        // compute newHeight and set .height/.marginTop
        var newHeight = 1 / (sourceAspect / screenWidth);
        this.domElement.style.height = newHeight + 'px';
        this.domElement.style.marginTop = -(newHeight - screenHeight) / 2 + 'px'; // init style.width/.marginLeft to normal value

        this.domElement.style.width = screenWidth + 'px';
        this.domElement.style.marginLeft = '0px';
      }
    }

    copyElementSizeTo(otherElement, margin, ctl) {
      if (window.innerWidth > window.innerHeight) {
        //landscape
        otherElement.style.width = this.domElement.style.width;
        otherElement.style.height = this.domElement.style.height;
        otherElement.style.marginLeft = this.domElement.style.marginLeft;
        otherElement.style.marginTop = this.domElement.style.marginTop;
      } else {
        //portrait
        otherElement.style.height = this.domElement.style.height;
        otherElement.style.width = parseInt(this.domElement.style.height) * 4 / 3 + 'px';

        if (margin) {
          otherElement.style.marginLeft = (window.innerWidth - parseInt(otherElement.style.width)) / 2 + 'px';
          otherElement.style.marginTop = 0;
        } else {
          otherElement.style.marginLeft = (window.innerWidth - parseInt(otherElement.style.width)) / 2 + 'px'; //otherElement.style.marginTop = 500;

          otherElement.style.marginTop = -((window.innerHeight - parseInt(otherElement.style.height)) / 2) + 'px';
        } //  otherElement.style.marginTop = 0;

      }
    }
    /*onError(msg) {
      console.log(msg);
      var msg1 = JSON.stringify(msg);
      alert(msg1);
    }*/


    onReady() {
      this.parent.onResize(); // console.log('ready', this.domElement);
    }

  }
  /* checkDevice() {
     var _this = this;
     // check API is available
     if (
       navigator.mediaDevices === undefined ||
       navigator.mediaDevices.enumerateDevices === undefined ||
       navigator.mediaDevices.getUserMedia === undefined
     ) {
       if (navigator.mediaDevices === undefined)
         var fctName = 'navigator.mediaDevices';
       else if (navigator.mediaDevices.enumerateDevices === undefined)
         var fctName = 'navigator.mediaDevices.enumerateDevices';
       else if (navigator.mediaDevices.getUserMedia === undefined)
         var fctName = 'navigator.mediaDevices.getUserMedia';

       _this.onError(
         'WebRTC issue-! ' + fctName + ' not present in your browser'
       );
       return null;
     }
   }*/

  class AKIT_ObjectARSource {
    constructor(sourceType, context) {
      //AKIT_ObjectVideo,
      this.properties = {};
      this.properties['sourceType'] = sourceType; //'webcam',

      this.properties['context'] = context;
      this.copyElementTo = true;
      this.init();
    }

    init() {
      let _me = this; //let arToolkitSource = new THREE.ArToolkitSource({
      // sourceType: this.properties.sourceType
      // });


      let arToolkitSource = new AKIT_ARJSToolkitSource(this, {
        sourceType: this.properties.sourceType
      });
      this.properties['arsource'] = arToolkitSource;
      this.properties.arsource.init(); //  this.properties.arsource.reinit();

      this.properties.arsource.init(function onReady() {
        _me.onResize(); //  console.log('AKIT_ObjectARSource');

      }); //console.log(APP.sourceAR);

      APP.sourceAR.appendChild(arToolkitSource.domElement); //  console.log('source',APP.sourceAR, arToolkitSource.domElement);

      window.addEventListener('resize', function () {
        _me.onResize();
      }); //  this.onResize();
      //  console.log('init arsource');
    }

    reinit() {
      this.properties.arsource.reinit(); // console.log('reinit arsource');
    }

    start() {
      //  this.properties.arsource.play();
      //  this.properties.arsource.startVideo(function onReady() {
      //    _me.onResize();
      //  });
      this.reinit(); //  console.log('start arsource');
    }

    resizeCopyElement(value) {
      this.copyElementTo = value;
    }

    onResize3() {
      var newWidth = 888;
      var screenHeight = 1980;
      this.properties.arsource.domElement.style.width = newWidth + 'px';
      this.properties.arsource.domElement.style.marginLeft = 0 + 'px'; // init style.height/.marginTop to normal value

      this.properties.arsource.domElement.style.height = screenHeight + 'px';
      this.properties.arsource.domElement.style.marginTop = '0px';
      APP.renderer.domElement.style.width = newWidth + 'px';
      APP.renderer.domElement.style.marginLeft = 0 + 'px'; // init style.height/.marginTop to normal value

      APP.renderer.domElement.style.height = screenHeight + 'px';
      APP.renderer.domElement.style.marginTop = '0px';
      console.log('onresize', APP.renderer.domElement, this.properties.arsource.domElement, this.properties.context.arController.canvas);
    }

    onResize2() {
      var hh = 1000;
      var ww = 1000;
      APP.renderer.domElement.height = hh;
      APP.renderer.domElement.width = ww;
      APP.renderer.domElement.style.height = hh;
      APP.renderer.domElement.style.width = ww;
      this.properties.arsource.height = hh;
      this.properties.arsource.width = ww;
      this.properties.arsource.domElement.style.height = hh;
      this.properties.arsource.domElement.style.width = ww;

      if (this.properties.context.arController !== null) {
        AKIT.scene.camera.projectionMatrix.copy(this.properties.context.getProjectionMatrix());
      }

      console.log('onresize', APP.renderer.domElement, this.properties.arsource.domElement, this.properties.context.arController.canvas);
    }

    onResize() {
      this.properties.arsource.onResizeElement();
      this.properties.arsource.copyElementSizeTo(APP.renderer.domElement, this.copyElementTo, false); // this.properties.arsource.copyElementSizeTo(document.body,this.copyElementTo,false);

      if (this.properties.context.arController !== null) {
        this.properties.arsource.copyElementSizeTo(this.properties.context.arController.canvas, this.copyElementTo, true);
      }

      if (this.properties.context.arController !== null) {
        AKIT.scene.camera.projectionMatrix.copy(this.properties.context.getProjectionMatrix());
      }

      console.log('resize', APP.renderer.domElement, AKIT.canvas, AKIT.canvas.height, AKIT.canvas.width);
    }

    isReady() {
      return this.properties.arsource.ready;
    }

    getDomElement() {
      return this.properties.arsource.domElement;
    }

    stop() {
      // console.log('stop arsource');
      // console.log( this.properties.arsource.domElement.srcObject);
      this.properties.arsource.domElement.pause();
      this.stopStreamedVideo(this.properties.arsource.domElement); //  this.properties.arsource.domElement.srcObject = null;
      //  APP.sourceAR.removeChild(this.properties.arsource.domElement);
      //  APP.sourceAR=null;
      //  this.properties.arsource.domElement=null;
      // console.log(this.properties.arsource)
      //  console.log(this.properties.arsource.domElement)
    }

    stopStreamedVideo(videoElem) {
      let stream = videoElem.srcObject;
      let tracks = stream.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
      videoElem.srcObject = null;
    }

  }

  class AKIT_ARJSScene {
    constructor(sourceType, cameraParametersUrl, detectionMode) {
      this.properties = {};
      this.properties['sourceType'] = sourceType;
      this.properties['cameraParametersUrl'] = cameraParametersUrl;
      this.properties['detectionMode'] = detectionMode;
      this.context = new AKIT_ObjectARContext(this, this.properties.cameraParametersUrl, this.properties.detectionMode);
      this.source = new AKIT_ObjectARSource(this.properties.sourceType, this.context.properties.arcontext); //  console.log(APP.system)

      if (APP.system == "aframe") this.source.resizeCopyElement(false);
    }

    start() {
      this.source.start();
    }

    stop() {
      this.source.stop();
      this.context.stop();
    }

    init() {// console.log('init arjs scene');
    }

    contextReady() {
      // console.log('arjs - contextReady');
      AKIT.scene.window();
      this.source.onResize();
    }

    frame() {
      //  if (this.source!=undefined) {
      if (this.source.isReady() === false) return true;
      this.context.properties.arcontext.update(this.source.properties.arsource.domElement); // update scene.visible if the marker is seen

      AKIT.scene.scene.visible = AKIT.scene.camera.visible;
    } //console.log(AKIT.scene.camera.visible);
    // }


  }

  class AKIT_ARJSMarker {
    constructor(parent, context, object3d, parameters) {
      //AKIT_ObjectVideo,
      this.parent = parent;
      this.context = context; // handle default parameters

      this.parameters = {
        // size of the marker in meter
        size: 1,
        // type of marker - ['pattern', 'barcode', 'unknown' ]
        type: 'unknown',
        // url of the pattern - IIF type='pattern'
        patternUrl: null,
        // value of the barcode - IIF type='barcode'
        barcodeValue: null,
        // change matrix mode - [modelViewMatrix, cameraTransformMatrix]
        changeMatrixMode: 'modelViewMatrix',
        // minimal confidence in the marke recognition - between [0, 1] - default to 1
        minConfidence: 0.6
      }; // sanity check

      var possibleValues = ['pattern', 'barcode', 'unknown'];
      console.assert(possibleValues.indexOf(this.parameters.type) !== -1, 'illegal value', this.parameters.type);
      var possibleValues = ['modelViewMatrix', 'cameraTransformMatrix'];
      console.assert(possibleValues.indexOf(this.parameters.changeMatrixMode) !== -1, 'illegal value', this.parameters.changeMatrixMode); // create the marker Root

      this.object3d = object3d;
      this.object3d.matrixAutoUpdate = false;
      this.object3d.visible = false; //////////////////////////////////////////////////////////////////////////////
      //		setParameters
      //////////////////////////////////////////////////////////////////////////////

      this.setParameters(parameters);
      context.addMarker(this);

      if (this.context.parameters.trackingBackend === 'artoolkit') {
        this._initArtoolkit();
      } else if (this.context.parameters.trackingBackend === 'aruco') {
        // TODO create a ._initAruco
        // put aruco second
        this._arucoPosit = new POS.Posit(this.parameters.size, this.context.arucoContext.canvas.width);
      } else if (this.context.parameters.trackingBackend === 'tango') {
        this._initTango();
      } else console.assert(false);
    }

    dispose() {
      this.context.removeMarker(this); // TODO remove the event listener if needed
      // unloadMaker ???
    }

    setParameters(parameters) {
      if (parameters === undefined) return;

      for (var key in parameters) {
        var newValue = parameters[key];

        if (newValue === undefined) {
          console.warn("THREEx.ArMarkerControls: '" + key + "' parameter is undefined.");
          continue;
        }

        var currentValue = this.parameters[key];

        if (currentValue === undefined) {
          console.warn("THREEx.ArMarkerControls: '" + key + "' is not a property of this material.");
          continue;
        }

        this.parameters[key] = newValue;
      }
    } //////////////////////////////////////////////////////////////////////////////
    //		update controls with new modelViewMatrix
    //////////////////////////////////////////////////////////////////////////////

    /**
     * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
     * of things. it is done here.
     */
    //////////////////////////////////////////////////////////////////////////////
    //		utility functions
    //////////////////////////////////////////////////////////////////////////////

    /**
     * provide a name for a marker
     * - silly heuristic for now
     * - should be improved
     */


    name() {
      var name = '';
      name += this.parameters.type;

      if (this.parameters.type === 'pattern') {
        var url = this.parameters.patternUrl;
        var basename = url.replace(/^.*\//g, '');
        name += ' - ' + basename;
      } else if (this.parameters.type === 'barcode') {
        name += ' - ' + this.parameters.barcodeValue;
      } else {
        console.assert(false, 'no .name() implemented for this marker controls');
      }

      return name;
    } //////////////////////////////////////////////////////////////////////////////
    //		init for Artoolkit
    //////////////////////////////////////////////////////////////////////////////


    _initArtoolkit() {
      var _this = this;
      var delayedInitTimerId = setInterval(function () {
        // check if arController is init
        var arController = _this.context.arController;
        if (arController === null) return; // stop looping if it is init

        clearInterval(delayedInitTimerId);
        delayedInitTimerId = null; // launch the _postInitArtoolkit

        _this.postInit();
      }, 1000 / 50);
      return;
    }

    postInit() {
      var _this = this;

      let artoolkitMarkerId; // check if arController is init

      var arController = _this.context.arController; //  console.assert(arController !== null)
      // start tracking this pattern

      if (_this.parameters.type === 'pattern') {
        arController.loadMarker(_this.parameters.patternUrl, function (markerId) {
          artoolkitMarkerId = markerId;
          arController.trackPatternMarkerId(artoolkitMarkerId, _this.parameters.size);
        });
      } else if (_this.parameters.type === 'barcode') {
        artoolkitMarkerId = _this.parameters.barcodeValue;
        arController.trackBarcodeMarkerId(artoolkitMarkerId, _this.parameters.size);
      } else if (_this.parameters.type === 'unknown') {
        artoolkitMarkerId = null;
      } else {
        console.log(false, 'invalid marker type', _this.parameters.type);
      } // listen to the event


      arController.addEventListener('getMarker', function (event) {
        if (event.data.type === artoolkit.PATTERN_MARKER && _this.parameters.type === 'pattern') {
          if (artoolkitMarkerId === null) return;
          if (event.data.marker.idPatt === artoolkitMarkerId) _this.onMarkerFound(event);
        } else if (event.data.type === artoolkit.BARCODE_MARKER && _this.parameters.type === 'barcode') {
          // console.log('BARCODE_MARKER idMatrix', event.data.marker.idMatrix, artoolkitMarkerId )
          if (artoolkitMarkerId === null) return;
          if (event.data.marker.idMatrix === artoolkitMarkerId) _this.onMarkerFound(event);
        } else if (event.data.type === artoolkit.UNKNOWN_MARKER && _this.parameters.type === 'unknown') {
          _this.onMarkerFound(event);
        }
      });
    }

    onMarkerFound(event) {
      // honor his.parameters.minConfidence
      // console.log(event)
      if (event.data.type === artoolkit.PATTERN_MARKER && event.data.marker.cfPatt < this.parameters.minConfidence) return;
      if (event.data.type === artoolkit.BARCODE_MARKER && event.data.marker.cfMatt < this.parameters.minConfidence) return;
      this.parent.markerFound(event.data.marker.idPatt, event.data.marker.cfPatt, event.data.matrix);
    } //////////////////////////////////////////////////////////////////////////////
    //		aruco specific
    //////////////////////////////////////////////////////////////////////////////


    _initAruco() {
      this._arucoPosit = new POS.Posit(this.parameters.size, this.context.arucoContext.canvas.width);
    } //////////////////////////////////////////////////////////////////////////////
    //		init for Artoolkit
    //////////////////////////////////////////////////////////////////////////////


    _initTango() {
      console.log('init tango ArMarkerControls');
    }

  }

  class AKIT_ObjectARJSMarkerControls extends AKIT_Object {
    constructor(id, parent, arToolkitContext, object3D, type, patternUrl, imgUrl, changeMatrixMode) {
      super();
      this.properties['id'] = id;
      this.properties['parent'] = parent;
      this.properties['type'] = type; //'pattern',

      this.properties['patternUrl'] = patternUrl; //'../../data/test/patt.hiro',

      this.properties['imgUrl'] = imgUrl;
      this.properties['changeMatrixMode'] = changeMatrixMode; //'cameraTransformMatrix'

      if (object3D == 'camera') this.properties['object3D'] = AKIT.scene.camera;else this.properties['object3D'] = object3D;
      this.init(arToolkitContext);
    }

    init(arToolkitContext) {
      // init controls for camera
      let markerControls = new AKIT_ARJSMarker(this.properties.parent, arToolkitContext, this.properties.object3D, {
        type: this.properties.type,
        patternUrl: this.properties.patternUrl,
        // patternUrl : '../../data/data/patt.kanji',
        // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        changeMatrixMode: this.properties.changeMatrixMode
      });
      this.properties['armarkerctl'] = markerControls;
    }

    initx(arToolkitContext) {
      // init controls for camera
      let markerControls = new THREEx.ArMarkerControls(arToolkitContext, this.properties.object3D, {
        type: this.properties.type,
        patternUrl: this.properties.patternUrl,
        // patternUrl : '../../data/data/patt.kanji',
        // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        changeMatrixMode: this.properties.changeMatrixMode
      });
      this.properties['armarkerctl'] = markerControls;
    } //  update() {
    //    this.properties.armarkerctl.update();
    //  }


  }

  class AKIT_ARJSMarkerMgr {
    constructor(parent) {
      this.parent = parent;
      this.context = AKIT.sceneAR.scene.context.properties.arcontext;
      this.markers = [];
      this.markerCodes = {};
      this.objects = {};
      this.timer = [];
      this.markerActive = -1;
      this.objectActive = -1;
      this.objectConfidence = 0;
      this.object3d = AKIT.scene.camera;
      this.timeoutObject = 100; // console.log('marker mgr');
    }

    addMarker(mid, mname, mfname, mscheme) {
      const type = 'pattern';
      this.changeMatrixMode = 'cameraTransformMatrix';
      this.markerScheme = mscheme;
      let object3D = 'camera';
      let patternUrl = APP.markerDirectory + mname + '/' + mfname; //pattern-marker.patt";

      let markerImg = APP.markerDirectory + mname + '/' + 'marker.png'; // console.log(mid, markerImg,mname);

      let mc = new AKIT_ObjectARJSMarkerControls(mid, this, this.context, object3D, type, patternUrl, markerImg, this.changeMatrixMode);
      this.markers.push(mc); // mc.code=mname;

      let idPatt = this.markers.length - 1;
      this.markerCodes[idPatt] = mname;
      this.timer.push(Date.now());
      return mc; /////////////////////////
      //if (this.markerScheme == 'objectPerMarker') {
      //  addModelObject(idPatt,obj3D)
      // }
    }

    addModelObject(idPatt, obj3D) {
      this.objects[idPatt] = obj3D;
    }

    markerCycle() {
      if (this.markerActive != -1) {
        let t = Date.now() - this.timer[this.markerActive];

        if (t > this.timeoutObject) {
          this.clearObject(this.markerActive);
          this.markerActive = -1;
          this.objectConfidence = 0;
          this.setMarkerInActive();
        }
      }
    }

    markerFound(idPatt, cfPatt, eventMatrix) {
      const mcode = this.markerCodes[idPatt];
      if (this.markerScheme == 'objectSelect') this.markerSchemeSelect(idPatt, mcode, cfPatt, eventMatrix);else this.markerSchemePer(idPatt, mcode, cfPatt, eventMatrix);
    }

    setMarkerActive() {
      APP.run.parent.markerVisibleUpdated(true);
    }

    setMarkerInActive() {
      APP.run.parent.markerVisibleUpdated(false);
    } //////////////////////////////////////////////////////////////////////per scheme


    markerSchemePer(idPatt, mCode, cfPatt, eventMatrix) {
      let setObj = false;

      if (idPatt != this.markerActive) {
        if (cfPatt >= this.objectConfidence) {
          setObj = true;
        } else {
          let t = Date.now() - this.timer[this.markerActive];
          if (t > this.timeoutObject) setObj = true;
        }
      } else setObj = true; // 0 0.8801993743028066 false -1 0
      // 0 0.739000321680015 false -1 0
      //   console.log(idPatt, cfPatt, setObj,this.markerActive,this.objectConfidence);


      if (setObj) {
        if (this.setObject(idPatt, mCode)) {
          if (this.markerActive != idPatt) this.clearObject(this.markerActive);
          this.markerActive = idPatt;
          this.objectConfidence = cfPatt;
          this.setMarkerActive(); //   this.setObject(this.markerActive);
        }
      }

      this.updateMatrix(eventMatrix);
      this.timer[idPatt] = Date.now();
    }

    setObject(idPatt, mCode) {
      let obj = this.getObject(idPatt, mCode);

      if (obj != false) {
        if (this.objectActive != obj) {
          if (this.objectActive != -1) {
            this.objectActive.activeUnset();
          }

          this.objectActive = obj;
        }

        return obj.activeSet();
      }

      return false;
    }

    clearObject(idPatt) {
      if (idPatt != -1) {
        let obj = this.getObject(idPatt);

        if (obj != undefined) {
          obj.activeUnset();
        }
      }
    } //////////////////////////////////////////////////////////////////////////////////////select scheme


    markerSchemeSelect(idPatt, mCode, cfPatt, eventMatrix) {
      if (this.parent.objectSelect != this.parent.objectSelected) {
        var unselect = this.parent.objectSelect;
        this.parent.objectSelect = this.parent.objectSelected;
        if (unselect != -1) this.clearObjectSelect(idPatt, unselect);
        this.setObjectSelect(idPatt, this.parent.objectSelect);
      }

      this.updateMatrix(eventMatrix);
    }

    setObjectSelect(idPatt, i) {
      let objIdx = this.objects[idPatt];
      let obj = this.getObject(objIdx);

      if (obj != undefined) {
        obj.markerActive();
        return true;
      }

      return false;
    }

    clearObjectSelect(idPatt, i) {
      let objIdx = this.objects[idPatt];

      if (objIdx != undefined) {
        let obj = this.getObject(objIdx); // let objs = obj[i];

        obj.markerInActive();
      }
    }

    getObject(idPatt, mCode) {
      return this.parent.objectGet(idPatt, mCode);
    }

    updateMatrix(eventMatrix) {
      var modelViewMatrix = new THREE.Matrix4().fromArray(eventMatrix);
      this.updateWithModelViewMatrix(modelViewMatrix);
    }

    updateWithModelViewMatrix(modelViewMatrix) {
      var markerObject3D = this.object3d; // mark object as visible

      markerObject3D.visible = true;

      if (this.context.parameters.trackingBackend === 'artoolkit') {
        // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
        var tmpMatrix = new THREE.Matrix4().copy(this.context._artoolkitProjectionAxisTransformMatrix);
        tmpMatrix.multiply(modelViewMatrix);
        modelViewMatrix.copy(tmpMatrix);
      } else if (this.context.parameters.trackingBackend === 'aruco') ; else if (this.context.parameters.trackingBackend === 'tango') ; else console.assert(false);

      if (this.context.parameters.trackingBackend !== 'tango') {
        // change axis orientation on marker - artoolkit say Z is normal to the marker - ar.js say Y is normal to the marker
        var markerAxisTransformMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);
        modelViewMatrix.multiply(markerAxisTransformMatrix);
      } // change markerObject3D.matrix based on parameters.changeMatrixMode


      if (this.changeMatrixMode === 'modelViewMatrix') {
        markerObject3D.matrix.copy(modelViewMatrix);
      } else if (this.changeMatrixMode === 'cameraTransformMatrix') {
        markerObject3D.matrix.getInverse(modelViewMatrix);
      } else {
        console.assert(false);
      } // decompose - the matrix into .position, .quaternion, .scale


      markerObject3D.matrix.decompose(markerObject3D.position, markerObject3D.quaternion, markerObject3D.scale);
    }

  }

  class AKIT_ARJS {
    constructor() {
      this.properties = {};
    }

    init() {
      const sourceType = 'webcam';
      const detectionMode = 'mono';
      const cameraParametersUrl = APP.arjs.cameraParametersUrl; //'/data/test/camera_para.dat';

      this.scene = new AKIT_ARJSScene(sourceType, cameraParametersUrl, detectionMode);
      this.scene.init();
    }

    marker(p) {
      return new AKIT_ARJSMarkerMgr(p);
    }

    start() {
      this.scene.start();
    }

    stop() {
      if (this.scene != undefined) this.scene.stop();
    }

    frame() {
      this.scene.frame();
    } //  resizeCopyElement(val) {
    //    this.scene.source.resizeCopyElement(val);
    //  }


  }

  // import AKIT_OpenCV from '../platform/opencv/akit-OpenCV';

  class AKIT_ARAppAR {
    constructor(p) {
      this.parent = p;
      this.parent.deviceCheck = false;
    } /////////////////////////////////////////////////////////////////////////////////////AR PLATFORM


    startARPlatform(platform) {
      this.platform = platform;

      if (platform == 'arjs') {
        this.initARJS();
      } else if (platform == 'webxr') {
        this.initWebXR();
      } else if (platform == 'web3ar') {
        this.initWeb3AR();
      } else if (platform == '8wall') {
        this.init8Wall();
      } else if (platform == 'tracking') {
        this.initTracking();
      } else if (platform == 'opencv') {
        this.initOpenCV();
      }
    }
    /*
    startARPlatform() {
      if (APP.platformAR == 'arjs') {
        this.initARJS();
      } else if (APP.platformAR == 'webxr') {
        this.initWebXR();
      } else if (APP.platformAR == 'web3ar') {
        this.initWeb3AR();
      } else if (APP.platformAR == '8wall') {
        this.init8Wall();
      }
    }*/


    load() {
      this.render = false;

      if (this.platform == 'arjs') {
        this.loadARJS();
      } else if (this.platform == 'webxr') ; else if (this.platform == 'web3ar') ; else if (this.platform == '8wall') ; else if (this.platform == 'tracking') ;
    }

    stop() {
      if (this.platform == 'arjs') {
        this.stopARJS();
      } else if (this.platform == 'webxr') ; else if (this.platform == 'web3ar') ; else if (this.platform == '8wall') ;
    }

    check() {
      if (this.platform == 'arjs') {
        this.initARJSCheck();
        this.loadARJSCheck();
      } else if (this.platform == 'tracking') {
        this.loadTracking();
      } else if (this.platform == 'opencv') {
        this.loadOpenCV();
      } else if (this.platform == '8wall') {
        return this.load8WAll();
      }

      return true;
    } ////////////////////////////////////////////////


    initOpenCV() {
      if (AKIT.scene == 0) {
        AKIT.scene = AKIT.getSceneObject();
        AKIT.scene.init();
        APP.run.scene();
        this.parent.setSource(); //  AKIT.sceneAR = new AKIT_OpenCV();

        APP.run.app.initAppScene();
      }
    }

    loadOpenCV() {
      AKIT.sceneAR.init();
      this.parent.marker();
      AKIT.sceneAR.start(); //  this.parent.render = true;
    } ///////////////////////////////////////////////////////


    initTracking() {
      if (AKIT.scene == 0) {
        AKIT.scene = AKIT.getSceneObject(); //new AKIT_Scene();

        AKIT.scene.init();
        APP.run.scene();
        this.parent.setSource(); // AKIT.sceneAR = new AKIT_Tracking();

        APP.run.app.initAppScene();
      }
    }

    loadTracking() {
      AKIT.sceneAR.init();
      this.parent.marker();
      AKIT.sceneAR.start(); //  this.parent.render = true;
    } ////////////////////////////////////////////webXR


    initWebXR() {
      AKIT.sceneAR = new AKIT_WebXR();
      AKIT.sceneAR.init();
    }

    initWeb3AR() {
      AKIT.sceneAR = new AKIT_Web3AR();
      AKIT.sceneAR.init();
    }

    init8Wall() {
      console.log('init8Wall');
      var w8 = AKIT_PROPS['8wall'];
      loadJS(w8.keyurl, document.body); // console.log('init8Wall',document,document.getElementById('appscene'))

      APP.sourceAR = document.getElementById('appscene');

      if (AKIT.canvas == undefined || AKIT.canvas == 0) {
        AKIT.canvas = document.createElement('canvas');
        AKIT.canvas.height = 640;
        AKIT.canvas.width = 480;
      } //console.log('init8Wall',w8,APP.sourceAR,AKIT.canvas)


      APP.sourceAR.appendChild(AKIT.canvas);
      AKIT.sceneAR = new AKIT_8Wall();
      AKIT.sceneAR.init();
      this.parent.env();
    }

    load8WAll() {
      //  console.log('load8WAll')
      return AKIT.sceneAR.load();
    } /////////////////////////////////////////////AR JS


    initARJS() {
      console.log('initARJS');

      if (AKIT.scene == 0) {
        AKIT.scene = AKIT.getSceneObject();
      }

      AKIT.scene.init();
      APP.run.scene();
      this.parent.setSource();
      AKIT.sceneAR = new AKIT_ARJS(); //  AKIT.sceneAR.init();  //tmp
      //  this.parent.marker();  //tmp
    }

    initARJSCheck() {
      AKIT.sceneAR.init();
      this.parent.marker();
    }

    loadARJS() {// this.objects();
      //  APP.renderer.setClearColor(0xb0f442 );
      // APP.renderer.setClearAlpha(1);
      // this.parent.setCanvas();
      //  this.parent.setVideoElement();
      //  this.parent.render = true;   //tmp
      //  this.startARJS();  //tmp
      //  console.log("0",APP.renderer)
    }

    loadARJSCheck() {
      //  this.parent.render = true; //tmp
      this.startARJS(); //tmp
    }

    startARJS() {
      AKIT.sceneAR.start();
    }

    stopARJS() {
      //   this.parent.removeCanvas();
      // this.parent.removeSource();
      AKIT.sceneAR.stop();
      this.parent.unsetVideoElement(); // this.parent.unsetCanvas();

      AKIT.scene.reset();
    }

  }

  /**
   * @author mrdoob / http://mrdoob.com
   * @author Mugen87 / https://github.com/Mugen87
   *
   * Based on @tojiro's vr-samples-utils.js
   */
  class AKIT_WebVR {
    constructor() {}

    buttonMode() {
      ////////////////////////////////////////////WEBVR START
      this.lib = {
        createButton: function (renderer, options) {
          function showEnterVR(device) {
            button.style.display = '';
            button.style.cursor = 'pointer';
            button.style.left = 'calc(50% - 50px)';
            button.style.width = '100px';
            button.textContent = 'ENTER VR';

            button.onmouseenter = function () {
              button.style.opacity = '1.0';
            };

            button.onmouseleave = function () {
              button.style.opacity = '0.5';
            };

            button.onclick = function () {
              device.isPresenting ? device.exitPresent() : device.requestPresent([{
                source: renderer.domElement
              }]);
            };

            renderer.vr.setDevice(device);
          }

          function showEnterXR(device) {
            var currentSession = null;

            function onSessionStarted(session) {
              if (options === undefined) options = {};
              if (options.frameOfReferenceType === undefined) options.frameOfReferenceType = 'stage';
              session.addEventListener('end', onSessionEnded);
              renderer.vr.setSession(session, options);
              button.textContent = 'EXIT VR';
              currentSession = session;
            }

            function onSessionEnded(event) {
              currentSession.removeEventListener('end', onSessionEnded);
              renderer.vr.setSession(null);
              button.textContent = 'ENTER VR';
              currentSession = null;
            } //


            button.style.display = '';
            button.style.cursor = 'pointer';
            button.style.left = 'calc(50% - 50px)';
            button.style.width = '100px';
            button.textContent = 'ENTER VR';

            button.onmouseenter = function () {
              button.style.opacity = '1.0';
            };

            button.onmouseleave = function () {
              button.style.opacity = '0.5';
            };

            button.onclick = function () {
              if (currentSession === null) {
                device.requestSession({
                  immersive: true,
                  exclusive: true
                  /* DEPRECATED */

                }).then(onSessionStarted);
              } else {
                currentSession.end();
              }
            };

            renderer.vr.setDevice(device);
          }

          function showVRNotFound() {
            button.style.display = '';
            button.style.cursor = 'auto';
            button.style.left = 'calc(50% - 75px)';
            button.style.width = '150px';
            button.textContent = 'VR NOT FOUND';
            button.onmouseenter = null;
            button.onmouseleave = null;
            button.onclick = null;
            renderer.vr.setDevice(null);
          }

          function stylizeElement(element) {
            element.style.position = 'absolute';
            element.style.bottom = '20px';
            element.style.padding = '12px 6px';
            element.style.border = '1px solid #fff';
            element.style.borderRadius = '4px';
            element.style.background = 'rgba(0,0,0,0.1)';
            element.style.color = '#000';
            element.style.font = 'normal 13px sans-serif';
            element.style.textAlign = 'center';
            element.style.opacity = '0.5';
            element.style.outline = 'none';
            element.style.zIndex = '999';
          }

          if ('xr' in navigator) {
            var button = document.createElement('button');
            button.style.display = 'none';
            stylizeElement(button);
            navigator.xr.requestDevice().then(function (device) {
              device.supportsSession({
                immersive: true,
                exclusive: true
                /* DEPRECATED */

              }).then(function () {
                showEnterXR(device);
              }).catch(showVRNotFound);
            }).catch(showVRNotFound);
            return button;
          } else if ('getVRDisplays' in navigator) {
            var button = document.createElement('button');
            button.style.display = 'none';
            stylizeElement(button);
            window.addEventListener('vrdisplayconnect', function (event) {
              showEnterVR(event.display);
            }, false);
            window.addEventListener('vrdisplaydisconnect', function (event) {
              showVRNotFound();
            }, false);
            window.addEventListener('vrdisplaypresentchange', function (event) {
              button.textContent = event.display.isPresenting ? 'EXIT VR' : 'ENTER VR';
            }, false);
            window.addEventListener('vrdisplayactivate', function (event) {
              event.display.requestPresent([{
                source: renderer.domElement
              }]);
            }, false);
            navigator.getVRDisplays().then(function (displays) {
              if (displays.length > 0) {
                showEnterVR(displays[0]);
              } else {
                showVRNotFound();
              }
            }).catch(showVRNotFound);
            return button;
          } else {
            var message = document.createElement('a');
            message.href = 'https://webvr.info';
            message.innerHTML = 'WEBVR NOT SUPPORTED';
            message.style.left = 'calc(50% - 90px)';
            message.style.width = '180px';
            message.style.textDecoration = 'none';
            stylizeElement(message);
            return message;
          }
        }
      }; ////////////////////////////////////////////WEBVR END
    }

  }

  // import AKIT_Scene from '../../scene/akit-Scene';
  class AKIT_ARAppVR {
    constructor(p) {
      this.parent = p;
      this.properties = {};
      this.mode = 0;
      this.webvr();
    }

    webvr() {
      if (window.WEBVR == undefined) {
        this.webVR = new AKIT_WebVR();
        this.webVR.buttonMode();
        this.mode = 'button';
        window.WEBVR = this.webVR.lib;
      }
    } /////////////////////////////////////////////////////////////////////////////////////VR PLATFORM


    startVRPlatform(platform) {
      this.platform = platform;
      this.initWebVR();
    }

    load() {
      //  APP.renderer.setClearAlpha(0);
      this.propertiesSet();
      AKIT.scene.resetCamera(); // console.log("1",APP.renderer)
    }

    stop() {
      this.propertiesUnSet(); //  this.parent.unsetCanvas();

      AKIT.scene.reset();
    }

    initWebVR() {
      if (AKIT.scene == 0) {
        AKIT.scene = AKIT.getSceneObject();
        AKIT.scene.init();
        APP.run.scene();
        this.parent.setSceneWindow();

        let _me = this;

        window.addEventListener('resize', function () {
          _me.resize();
        });
        APP.run.resize();
        AKIT.scene.window();

        _me.resize();
      }
    }

    resize() {
      APP.renderer.domElement.width = AKIT.windowWidth;
      APP.renderer.domElement.height = AKIT.windowHeight;
      APP.renderer.domElement.style.width = AKIT.windowWidth + 'px';
      APP.renderer.domElement.style.height = AKIT.windowHeight + 'py';
      AKIT.canvas.width = AKIT.windowWidth;
      AKIT.canvas.height = AKIT.windowHeight; //   console.log('resize vr', AKIT.canvas, APP.renderer.domElement, APP.renderer.domElement.style, AKIT.canvas.height);
    }

    set() {
      if (this.mode == 'button') this.enableButtonVR();
    }

    enableButtonVR() {
      APP.renderer.vr.enabled = true;
      document.body.appendChild(WEBVR.createButton(APP.renderer));
      AKIT.alogKit(' (scene-vr-ready) vR Display:' + AKIT.vrDisplay);
    }
    /*
    display() {
      if (!navigator.getVRDisplays) {
        this.displayNotReady();
      } else {
        navigator.getVRDisplays().then(displays => {
          AKIT.vrDisplay = displays[0];
          this.displayReady();
        });
      }
    }
     displayReady() {
      APP.renderer.vr.enabled = true;
      //  APP.renderer.vr.standing = false;
      document.body.appendChild(WEBVR.createButton(APP.renderer));
       AKIT.alogKit(' (scene-vr-ready) vR Display:' + AKIT.vrDisplay);
    }
     displayNotReady() {
      AKIT.alogKit(' (scene-vr-not-ready) ' + ' WebVR API not available');
    }
    */


    propertiesSet() {
      let sceneOptions = APP.sceneOptions;

      if (sceneOptions['background3D'] != undefined) {
        AKIT.scene.scene.background = sceneOptions['background3D']; //   console.log('background 3d', AKIT.scene.scene.background);
      }

      if (sceneOptions['grid'] != undefined) {
        this.gridAdd(sceneOptions.worldSize);
      }
    }

    propertiesUnSet() {
      let sceneOptions = APP.sceneOptions;

      if (sceneOptions['grid'] != undefined) {
        this.gridRemove();
      }
    } //setRendererProperties3D() {
    //  APP.renderer.setClearColor(new THREE.Color('black'));
    //}


    skybox() {//skybox
      // this.background = new AKIT_ObjectTextureCube();
      //
      //  AKIT.scene.scene.background = this.background.properties.texture
      // AKIT.scene.scene.background = new THREE.Color( 0xffffff );
      //  AKIT.scene.scene.fog = new THREE.Fog( 0x443333, .0001, .0004 );
    }

    gridAdd(s) {
      if (this.properties['grid'] == undefined) {
        this.properties['grid'] = new THREE.GridHelper(100, s, 0xffffff, 0xffffff);
        this.properties.grid.position.set(0, 0, 0); // gridHelper.material.color.setRGB(0, 0, 0);
      }

      AKIT.scene.scene.add(this.properties.grid);
      this.properties.grid.visible = true; //  console.log('grid add', AKIT.scene);
    }

    gridRemove(s) {
      if (this.properties['grid'] != undefined) {
        AKIT.scene.scene.remove(this.properties.grid); //  console.log('grid rem', AKIT.scene);
      }
    }

  }

  class AKIT_ARJSMarkerMatrix {
    constructor(parent) {
      this.parent = parent;
      this.context = AKIT.sceneAR.scene.context.properties.arcontext;
      this.object3d = AKIT.scene.camera;
      this.changeMatrixMode = 'cameraTransformMatrix';
    }

    updateMatrix(eventMatrix) {
      var modelViewMatrix = new THREE.Matrix4().fromArray(eventMatrix);
      this.updateWithModelViewMatrix(modelViewMatrix);
    }

    updateWithModelViewMatrix(modelViewMatrix) {
      var markerObject3D = this.object3d; //  console.log(this.context.parameters.trackingBackend,this.changeMatrixMode);
      // mark object as visible

      markerObject3D.visible = true;

      if (this.context.parameters.trackingBackend === 'artoolkit') {
        // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
        var tmpMatrix = new THREE.Matrix4().copy(this.context._artoolkitProjectionAxisTransformMatrix);
        tmpMatrix.multiply(modelViewMatrix);
        modelViewMatrix.copy(tmpMatrix);
      } else if (this.context.parameters.trackingBackend === 'aruco') ; else if (this.context.parameters.trackingBackend === 'tango') ; else console.assert(false);

      if (this.context.parameters.trackingBackend !== 'tango') {
        // change axis orientation on marker - artoolkit say Z is normal to the marker - ar.js say Y is normal to the marker
        var markerAxisTransformMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);
        modelViewMatrix.multiply(markerAxisTransformMatrix);
      } // change markerObject3D.matrix based on parameters.changeMatrixMode


      if (this.changeMatrixMode === 'modelViewMatrix') {
        markerObject3D.matrix.copy(modelViewMatrix);
      } else if (this.changeMatrixMode === 'cameraTransformMatrix') {
        markerObject3D.matrix.getInverse(modelViewMatrix);
      } else {
        console.assert(false);
      } // decompose - the matrix into .position, .quaternion, .scale


      markerObject3D.matrix.decompose(markerObject3D.position, markerObject3D.quaternion, markerObject3D.scale);
    }

  }

  class AKIT_TrackingMarker {
    constructor(parent, url) {
      this.parent = parent;
      this.url = url;
      this.training();
      this.add();
      this.debugObjs = [];
    }

    add() {
      AKIT.sceneAR.add(this);
    }

    frame() {
      this.match(); //  this.cornersDebug();
    }

    onMarkerFound(event) {
      this.parent.markerFound(event.data.marker.idPatt, event.data.marker.cfPatt, event.data.matrix);
    }

    match() {
      var ewidth = 640;
      var eheight = 480;
      var awidth = window.innerWidth;
      var aheight = window.innerHeight; //   console.log(AKIT.sceneAR.descriptors.length,this.descriptors.length)

      var matches = tracking.Brief.reciprocalMatch(this.corners, this.descriptors, AKIT.sceneAR.corners, AKIT.sceneAR.descriptors);
      matches.sort(function (a, b) {
        return b.confidence - a.confidence;
      });

      for (var i = 0; i < matches.length; i++) {
        if (this.debugObjs[i] == undefined) {
          this.debugObjs[i] = new AKIT_ObjectTypeSphereDebug$1(0.01, 4, 4);
          this.debugObjs[i].add();
        }

        var kp = matches[i].keypoint2;
        var xx = kp[0] / ewidth * 2 - 1;
        var yy = -(kp[1] / eheight) * 2 + 1;
        this.debugObjs[i].positionXYZ(xx, yy, -5); //   console.log(i,matches[i].confidence);
        //console.log(i,matches[i],matches[i].keypoint1[0], matches[i].keypoint1[1]);
        //    if(i>10) break;
      } // console.log(matches.length)

    }

    training() {
      var _me = this;

      var img = new Image();

      img.onload = function () {
        _me.train(img);
      };

      img.src = this.url;
    }

    train(image) {
      AKIT.scene.windowSet(640, 480);
      AKIT.sceneAR.source.onResize();
      APP.renderer.domElement.style.width = 640;
      APP.renderer.domElement.style.height = 480;
      console.log(APP.renderer.domElement); //  var domElement = AKIT.sceneAR.source.properties.element
      //  domElement.style.width = 640;
      //  domElement.style.height = 480;
      //  console.log(domElement)

      var width = 640; //AKIT.canvas.width;

      var height = 480; //AKIT.canvas.height;
      //  var width = 256;//AKIT.canvas.width;
      //  var height = 256;//AKIT.canvas.height;

      var iwidth = 50; //image.width/5;

      var iheight = 50; //image.height/5;

      let blurRadius = 3;
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.canvas.width = width;
      this.canvas.height = height;
      this.context.drawImage(image, 0, 0, iwidth, iheight); //  this.context.drawImage(image,0,0);

      var imageData = this.context.getImageData(0, 0, width, height);
      var gray = tracking.Image.grayscale(tracking.Image.blur(imageData.data, width, height, blurRadius), width, height);
      let corners = tracking.Fast.findCorners(gray, width, height);
      this.descriptors = tracking.Brief.getDescriptors(gray, width, corners);
      this.corners = corners;
      console.log('train', this.url, width, height, iwidth, iheight, this.descriptors.length, corners.length);
    }

    cornersDebug() {
      var element = AKIT.canvas;
      var corners = AKIT.sceneAR.corners;
      var ewidth = 640;
      var eheight = 480;
      var awidth = window.innerWidth;
      var aheight = window.innerHeight;

      for (var i = 0; i < corners.length; i += 2) {
        if (this.debugObjs[i] == undefined) {
          this.debugObjs[i] = new AKIT_ObjectTypeSphereDebug$1(0.01, 4, 4);
          this.debugObjs[i].add();
        }

        let cscale = 0.1;
        var xx = corners[i] / ewidth * 2 - 1;
        var yy = -(corners[i + 1] / eheight) * 2 + 1;
        var xs = xx * cscale;
        var ys = yy * cscale;
        this.debugObjs[i].positionXYZ(xs, ys, -1); //    var xx = corners[i] * .1;
        //  var yy = corners[i + 1] * .1;
        //  this.debugObjs[i].positionXYZ(xx, yy, -1);
        //   console.log(i,xs,ys,corners[i],corners[i+1]);
        //console.log(i,matches[i],matches[i].keypoint1[0], matches[i].keypoint1[1]);

        if (i > 500) break;
      }
    } // console.log(matches.length)


  }
  /*

    debug() {

         this.debug=true;

         if (this.debug) {
           if (this.debugObjs[i] == undefined)
             this.debugObjs[i] = new AKIT_ObjectTypeSphereDebug(0.1, 1, 1);
           this.debugObjs[i].positionXYZ(xx, yy, 0);
         }

         let size=this.cornersSize;
         if (this.corners.length>this.cornersSize) {
           for (let i = size; i < corners.length; i += 2) {

                 // corners[i], corners[i + 1]
               this.cornersSize++;
           }

           console.log(this.cornersSize);

         }






  var FastTracker = function() {
    FastTracker.base(this, 'constructor');
  };
  tracking.inherits(FastTracker, tracking.Tracker);

  tracking.Fast.THRESHOLD = 2;
  FastTracker.prototype.threshold = tracking.Fast.THRESHOLD;

  FastTracker.prototype.track = function(pixels, width, height) {
    stats.begin();
    var gray = tracking.Image.grayscale(pixels, width, height);
    var corners = tracking.Fast.findCorners(gray, width, height);
    stats.end();

    this.emit('track', {
      data: corners
    });
  };*/

  class AKIT_ObjectARMarkerControlsTracker extends AKIT_Object {
    constructor(id, parent, imgUrl) {
      super();
      this.properties['id'] = id;
      this.properties['parent'] = parent;
      this.properties['imgUrl'] = imgUrl;
      this.init();
    }

    init() {
      this.properties['marker'] = new AKIT_TrackingMarker(this.properties.parent, this.properties.imgUrl);
    }

  }

  class AKIT_ObjectARMarkerControlsOpenCV extends AKIT_Object {
    constructor(id, parent, imgUrl) {
      super();
      this.properties['id'] = id;
      this.properties['parent'] = parent;
      this.properties['imgUrl'] = imgUrl;
      this.init();
    }

    init() {
      /*  this.properties['marker'] = new AKIT_OpenCVMarker(
          this.properties.parent,
          this.properties.imgUrl
        );*/
    }

  }

  class AKIT_XRAppMarkerMgr {
    constructor(parent) {
      this.parent = parent; // this.context = AKIT.sceneAR.scene.context.properties.arcontext;

      this.markers = [];
      this.markerCodes = {};
      this.objects = {};
      this.timer = [];
      this.markerActive = -1;
      this.objectActive = -1;
      this.objectConfidence = 0;
      this.object3d = AKIT.scene.camera;
      this.timeoutObject = 100; // console.log('marker mgr');
    }

    addMarker(mid, mname, mfname, mscheme) {
      let mdata, mc;
      console.log('addMarker', mid, mname, mfname, mscheme);

      if (APP.platformAR == 'arjs') {
        mc = this.addMarkerARJS(mid, mname, mfname);
        mdata = {
          id: mc.properties.id + 1,
          file: mc.properties.imgUrl
        };
        this.matrix = this.addMarkerMatrixARJS();
      } else if (APP.platformAR == 'tracking') {
        mc = this.addMarkerTracking(mid, mname, mfname, mscheme);
      } else if (APP.platformAR == 'opencv') {
        mc = this.addMarkerOpenCV(mid, mname, mfname, mscheme);
      }

      this.markerScheme = mscheme;
      this.markers.push(mc);
      let idPatt = this.markers.length - 1;
      this.markerCodes[idPatt] = mname;
      this.timer.push(Date.now());
      return mdata;
    } ///////////////////////////////////////////////////////////////////////////////ARJS


    addMarkerARJS(mid, mname, mfname) {
      const type = 'pattern';
      this.changeMatrixMode = 'cameraTransformMatrix';
      let object3D = 'camera';
      let patternUrl, markerImg;
      var isurl = mfname.indexOf('https');

      if (isurl != -1) {
        patternUrl = mfname;
        markerImg = "";
        console.log('marker URL', mfname);
      } else {
        patternUrl = APP.markerDirectory + mname + '/' + mfname; //pattern-marker.patt";

        markerImg = APP.markerDirectory + mname + '/' + 'marker.png';
      }

      let contextAR = AKIT.sceneAR.scene.context.properties.arcontext;
      let mc = new AKIT_ObjectARJSMarkerControls(mid, this, contextAR, object3D, type, patternUrl, markerImg, this.changeMatrixMode);
      return mc;
    }

    addMarkerMatrixARJS() {
      return new AKIT_ARJSMarkerMatrix(this);
    } ///////////////////////////////////////////////////////////////////////////////Tracking


    addMarkerTracking(mid, mname, mfname, mscheme) {
      let markerImg = APP.markerDirectory + mname + '/' + 'marker.png';
      let mc = new AKIT_ObjectARMarkerControlsTracker(mid, this, markerImg);
      return mc;
    } ///////////////////////////////////////////////////////////////////////////////Tracking


    addMarkerOpenCV(mid, mname, mfname, mscheme) {
      let markerImg = APP.markerDirectory + mname + '/' + 'marker.png';
      let mc = new AKIT_ObjectARMarkerControlsOpenCV(mid, this, markerImg);
      return mc;
    } //////////////////////////////////////////////////////////////////////////////////////////////


    addModelObject(idPatt, obj3D) {
      this.objects[idPatt] = obj3D;
    }

    markerCycle() {
      if (this.markerActive != -1) {
        let t = Date.now() - this.timer[this.markerActive];

        if (t > this.timeoutObject) {
          this.clearObject(this.markerActive);
          this.markerActive = -1;
          this.objectConfidence = 0;
          this.setMarkerInActive();
        }
      }
    }

    markerFound(idPatt, cfPatt, eventMatrix) {
      const mcode = this.markerCodes[idPatt]; //   console.log(idPatt, cfPatt,this.markerScheme,eventMatrix);

      if (this.markerScheme == 'objectSelect') this.markerSchemeSelect(idPatt, mcode, cfPatt, eventMatrix);else this.markerSchemePer(idPatt, mcode, cfPatt, eventMatrix);
    }

    setMarkerActive() {
      APP.run.parent.markerVisibleUpdated(true);
    }

    setMarkerInActive() {
      APP.run.parent.markerVisibleUpdated(false);
    } //////////////////////////////////////////////////////////////////////per scheme


    markerSchemePer(idPatt, mCode, cfPatt, eventMatrix) {
      let setObj = false;

      if (idPatt != this.markerActive) {
        if (cfPatt >= this.objectConfidence) {
          setObj = true;
        } else {
          let t = Date.now() - this.timer[this.markerActive];
          if (t > this.timeoutObject) setObj = true;
        }
      } else setObj = true; // 0 0.8801993743028066 false -1 0
      // 0 0.739000321680015 false -1 0
      //   console.log(idPatt, cfPatt, setObj,this.markerActive,this.objectConfidence);


      if (setObj) {
        if (this.setObject(idPatt, mCode)) {
          if (this.markerActive != idPatt) this.clearObject(this.markerActive);
          this.markerActive = idPatt;
          this.objectConfidence = cfPatt;
          this.setMarkerActive(); //   this.setObject(this.markerActive);
        }
      }

      this.matrix.updateMatrix(eventMatrix);
      this.timer[idPatt] = Date.now();
    }

    setObject(idPatt, mCode) {
      let obj = this.getObject(idPatt, mCode);

      if (obj != false) {
        if (this.objectActive != obj) {
          if (this.objectActive != -1) {
            this.objectActive.activeUnset();
          }

          this.objectActive = obj;
        }

        return obj.activeSet();
      }

      return false;
    }

    clearObject(idPatt) {
      if (idPatt != -1) {
        let obj = this.getObject(idPatt);

        if (obj != undefined) {
          obj.activeUnset();
        }
      }
    } //////////////////////////////////////////////////////////////////////////////////////select scheme


    markerSchemeSelect(idPatt, mCode, cfPatt, eventMatrix) {
      if (this.parent.objectSelect != this.parent.objectSelected) {
        var unselect = this.parent.objectSelect;
        this.parent.objectSelect = this.parent.objectSelected;
        if (unselect != -1) this.clearObjectSelect(idPatt, unselect);
        this.setObjectSelect(idPatt, this.parent.objectSelect);
      }

      this.matrix.updateMatrix(eventMatrix);
    }

    setObjectSelect(idPatt, i) {
      let objIdx = this.objects[idPatt];
      let obj = this.getObject(objIdx);

      if (obj != undefined) {
        obj.markerActive();
        return true;
      }

      return false;
    }

    clearObjectSelect(idPatt, i) {
      let objIdx = this.objects[idPatt];

      if (objIdx != undefined) {
        let obj = this.getObject(objIdx); // let objs = obj[i];

        obj.markerInActive();
      }
    }

    getObject(idPatt, mCode) {
      return this.parent.objectGet(idPatt, mCode);
    } /////////////////////////////////////////////////////////////////////////////////matrix

    /*
    updateMatrix(eventMatrix) {
      var modelViewMatrix = new THREE.Matrix4().fromArray(eventMatrix);
      this.updateWithModelViewMatrix(modelViewMatrix);
    }
      updateWithModelViewMatrix(modelViewMatrix) {
      var markerObject3D = this.object3d;
        // mark object as visible
      markerObject3D.visible = true;
        if (this.context.parameters.trackingBackend === 'artoolkit') {
        // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
        var tmpMatrix = new THREE.Matrix4().copy(
          this.context._artoolkitProjectionAxisTransformMatrix
        );
        tmpMatrix.multiply(modelViewMatrix);
          modelViewMatrix.copy(tmpMatrix);
      } else if (this.context.parameters.trackingBackend === 'aruco') {
        // ...
      } else if (this.context.parameters.trackingBackend === 'tango') {
        // ...
      } else console.assert(false);
        if (this.context.parameters.trackingBackend !== 'tango') {
        // change axis orientation on marker - artoolkit say Z is normal to the marker - ar.js say Y is normal to the marker
        var markerAxisTransformMatrix = new THREE.Matrix4().makeRotationX(
          Math.PI / 2
        );
        modelViewMatrix.multiply(markerAxisTransformMatrix);
      }
        // change markerObject3D.matrix based on parameters.changeMatrixMode
      if (this.changeMatrixMode === 'modelViewMatrix') {
        markerObject3D.matrix.copy(modelViewMatrix);
      } else if (this.changeMatrixMode === 'cameraTransformMatrix') {
        markerObject3D.matrix.getInverse(modelViewMatrix);
      } else {
        console.assert(false);
      }
        // decompose - the matrix into .position, .quaternion, .scale
      markerObject3D.matrix.decompose(
        markerObject3D.position,
        markerObject3D.quaternion,
        markerObject3D.scale
      );
    }
    */


  }

  class AKIT_XRAppEnvMgr {
    constructor(parent) {
      this.parent = parent;
      this.objects = {};
      this.timer = []; //  this.envActive = -1;

      this.focusObjectActive = -1; //  this.envConfidence = 0;

      this.timeoutObject = 100;
      this.groupId = "1"; ///init

      this.groupCode = "1";
      this.focusObject = {};
      this.focusObjectId = -1;
      this.event = {
        place: false // console.log('env mgr');

      };
    }

    setEnvEvent(event, eventid, opts) {
      if (event == 'place') {
        this.setEnvEventPlace(opts.point);
      }
    }

    setEnvEventPlace(point) {
      if (!this.event.place) {
        this.event.place = true;
        this.envAddFocusObject(this.groupId, this.groupCode, 1.0, {
          point: point
        });
      }
    }

    envCycle() {
      if (this.focusObject.id != undefined) {
        this.envUpdFocusObject(); //  let t = Date.now() - this.timer[this.envActive];
        //    if (t > this.timeoutObject) {
        //  this.clearObject(this.envActive);
        //    this.envActive = -1;
        //  this.envConfidence = 0;
        //  this.setenvInActive();
        //}
      }
    }

    setEnvActive() {
      APP.run.parent.markerVisibleUpdated(true);
    }

    setEnvInActive() {
      APP.run.parent.markerVisibleUpdated(false);
    } //////////////////////////////////////////////////////////////////////per scheme


    envAddFocusObject(id, code, conf, opt) {
      this.focusObject = {
        id: id,
        code: code,
        conf: conf,
        opt: opt
      };
      console.log('focus obj', this.focusObject);
    }

    envDelFocusObject(id, code, conf, opt) {
      this.focusObject = {};
    }

    envUpdFocusObject() {

      {
        if (this.setFocusObject(this.focusObject.id, this.focusObject.code, this.focusObject.opt)) {
          if (this.focusObjectId != this.focusObject.id) this.clearObject(this.focusObject.id, this.focusObject.opt);
          this.focusObjectId = this.focusObject.id; //  this.focusObject.conf = conf;

          this.setEnvActive(); //   this.setObject(this.envActive);
        }
      }

      this.timer[this.focusObject.id] = Date.now();
    }

    setFocusObject(id, code, opt) {
      /////one obj at a time
      let obj = this.getObject(id, code);

      if (obj != false) {
        if (this.focusObjectActive != obj) {
          if (this.focusObjectActive != -1) {
            this.focusObjectActive.activeUnset(opt);
          }

          this.focusObjectActive = obj;
        }

        return obj.activeSet(opt);
      }

      return false;
    }

    clearObject(id, opt) {
      if (id != -1) {
        let obj = this.getObject(id);

        if (obj != undefined) {
          obj.activeUnset(opt);
        }
      }
    }

    getObject(id, code) {
      return this.parent.objectGet(id, code);
    } /////////////////////////////////////////////////////////////////////////////////matrix


  }

  class AKIT_ARApp {
    constructor() {
      this.startedAR = false;
      this.startedVR = false;
      this.objectFocus = 0;
    }

    initProperties() {
      let hratio = 0.6;
      let wratio = 0.6;
      let dratio = 1;
      APP.UI.data.HeightDefault = this.markerDistance * hratio;
      APP.UI.data.WidthDefault = this.markerDistance * wratio;
      APP.UI.data.DepthDefault = this.markerDistance * dratio;
      APP.UI.data.Height = APP.UI.data.HeightDefault;
      APP.UI.data.Width = APP.UI.data.WidthDefault;
      APP.UI.data.Depth = APP.UI.data.DepthDefault; // this.objectSelect = -1;
      // this.objectSelected = 0;
      // this.objectsGroupSelect = -1;
      //  this.objectsGroupSelectData = [];

      if (APP.platformAR == 'arjs') {
        this.markerDistance = APP.arjs.markerDistance; // dist MM
      }
    }

    initApp() {
      this.render = false;
      this.deviceCheck = false;
      this.objectsInit();
    }

    resize() {
      this.setSceneWindow();
    } /////////////////////////////////////////////////////////////////////////////////////SET


    setSource() {
      if (APP.sourceAR == undefined) {
        // APP.sourceAR = document.createElement('arsource'); //document.getElementById('arsource');
        // console.log('source', APP.sourceAR);
        APP.sourceAR = document.getElementById('appscene'); //  if (APP.sourceAR == undefined) {
        //    APP.sourceAR = document.body.getElementById('appscene');
        //  }
        //   console.log('source',APP.sourceAR,document.body);
      }
    } // removeSource() {
    //  document.removeChild('arsource')
    //    APP.sourceAR = undefined;
    // }


    setElement() {
      let sceneApp = document.getElementById('appscene'); //  sceneApp.appendChild(APP.sourceAR);
      // console.log('element', sceneApp, APP.sourceAR);
    }

    setElement1() {
      let sceneApp = document.getElementById('appscene'); //    sceneApp.appendChild(APP.sourceAR);
      // console.log('element', sceneApp, APP.sourceAR);
    } // removeElement() {
    //  let sceneApp = document.getElementById('appscene');
    //   sceneApp.removeChild(APP.sourceAR);
    //}


    setCanvas() {// let sceneApp = document.getElementById('appscene');
      // sceneApp.appendChild(AKIT.canvas);
      // APP.sourceAR.appendChild(AKIT.canvas);
      // console.log('canvas', sceneApp, sceneApp.offsetHeight);
    }

    setSceneWindow() {
      let sceneApp = document.getElementById('appscene');

      if (sceneApp != undefined) {
        AKIT.windowHeight = window.innerHeight;
        AKIT.windowWidth = window.innerWidth;
        console.log('resize scene window', AKIT.windowHeight, AKIT.windowWidth);
      }
    }

    unsetCanvas() {
      let sceneApp = document.getElementById('appscene');
      sceneApp.removeChild(AKIT.canvas);
    } // removeCanvas() {
    //   let sceneApp = document.getElementById('appscene');
    //   sceneApp.removeChild(AKIT.canvas);
    //  }


    setVideoElement() {
      if (AKIT.bgtexture == null) {
        let e = this.getVideo();
        AKIT.bgtexture = new THREE.VideoTexture(e);
        AKIT.bgtexture.minFilter = THREE.LinearFilter;
        AKIT.bgtexture.magFilter = THREE.LinearFilter;
        AKIT.bgtexture.format = THREE.RGBFormat;
      }

      AKIT.scene.scene.background = AKIT.bgtexture; //  console.log('vid backgrd',AKIT.scene.scene);
    }

    unsetVideoElement() {
      AKIT.scene.scene.background = new THREE.Color(0xffffff);
    }

    addIFrame() {
      let sceneApp = document.getElementById('appscene');
      var scene = document.createElement('iframe');
      scene.setAttribute('src', 'assets/lib/arjs/arjs-frame.html');
      console.log(scene);
      sceneApp.appendChild(scene);
    } /////////////////////////////////////////////////////////////////////////////////////GET


    getVideo() {
      return AKIT.sceneAR.scene.source.properties.arsource.domElement;
    } /////////////////////////////////////////////////////////////////////////////////////VR PLATFORM


    startVR(platform) {
      this.startVRPlatform(platform);
    }

    startedVRCheck() {
      return this.startedVR;
    }

    startVRApp() {
      if (this.vr == undefined) this.vr = new AKIT_ARAppVR(this);
    }

    startVRPlatform(startVRPlatform) {
      this.startedVR = true;
      this.startVRApp();
      this.vr.startVRPlatform(startVRPlatform);
    }

    loadVR() {
      this.startVRApp();
      this.vr.load();
    }

    stopVR() {
      this.vr.stop();
    } /////////////////////////////////////////////////////////////////////////////////////AR PLATFORM


    startAR(platform) {
      this.startARPlatform(platform);
    }

    startedARCheck() {
      return this.startedAR;
    }

    startARApp() {
      if (this.ar == undefined) this.ar = new AKIT_ARAppAR(this);
    }

    checkedARApp() {
      return this.ar.check();
    }

    startARPlatform(platform) {
      this.startedAR = true;
      this.startARApp();
      this.ar.startARPlatform(platform);
    }

    loadAR() {
      this.render = false;
      this.startARApp();
      this.ar.load();
    }

    cycleAR() {
      if (this.render) {
        AKIT.scene.render();
        AKIT.sceneAR.frame();

        if (this.markerMgr != undefined) {
          this.markerMgr.markerCycle();
          this.markerVisible = this.markerMgr.markerActive;
        }

        if (this.envMgr != undefined) {
          this.envMgr.envCycle();
        }
      } else {
        if (!this.deviceCheck) {
          if (AKIT.devices.checkDeviceReady()) {
            this.deviceCheck = true;
          }
        }

        if (this.checkedARApp()) this.render = true;
      }
    }

    stopAR() {
      this.render = false;
      this.ar.stop();
    }

    loadARJS() {// this.objects();
      //  this.render = true;
    }

    env() {
      this.envMgr = new AKIT_XRAppEnvMgr(this);
    } /////////////////////////////////////////////////////////////////////////////////////MARKERS


    marker() {
      this.markerMgr = new AKIT_XRAppMarkerMgr(this);
      this.markers();
    }

    markers() {
      this.markerIds = {};
      const markerList = APP.markers;
      let markerObjs = [];

      for (let i = 0; i < markerList.length; i++) {
        let mname = markerList[i];
        let mid = i;
        let mdata = this.markerMgr.addMarker(mid, mname.name, mname.marker, mname.scheme);
        this.markerIds[mname.name] = mid;
        markerObjs.push(mdata); //    console.log(mobj,mobj.properties.id, mobj.properties.imgUrl);
      }

      APP.run.parent.call('markerGroup', markerObjs);
    } /////////////////////////////////////////////////////////////////////////////////////OBJECTS


    objectsLoad(id) {
      return this.objectsAR.objectsLoad(id);
    }

    objectsInit() {
      this.objectsAR = new AKIT_ARAppObjects(this);
      this.objectsAR.init();
    }

    objectAnchor(obj) {
      this.objectsAR.loadAnchor(obj);
    }

    object(obj) {
      this.objectsAR.loadObj(obj);
    }

    objects(objectList) {
      this.objectsAR.load(objectList);
    }

    objectGet(markerId, markerCode) {
      return this.objectsAR.objectGet(markerId, markerCode);
    }

    objectData(olist) {
      let data = {};
      return data;
    }

    objectIndexSet(index) {
      this.objectsAR.objectIndexSet(index);
    }

    objectIndexGet(index) {
      return this.objectsAR.objectIndexGet(index);
    }

    objectIndexFade() {
      this.objectsAR.objectIndexFade();
    }

    objectGroupDataSet() {
      this.objectsAR.objectGroupDataSet();
    } //////////////////////////////////////////focus object


    setFocusAction(mediaAction, mediaObj) {
      if (mediaAction == 'autoplay') {
        if (mediaObj.properties['video'] != undefined) {
          this.objectFocus = mediaObj.properties.video;
          this.objectFocusAction = 'autoplay';
        }
      } //  console.log(mediaAction,this.objectFocus);

    }

    clearFocusAction() {
      this.objectFocus = 0;
      this.objectFocusAction = ''; // console.log('clear')
    }

    eventGlobalTouchEnd() {
      //console.log('event',this.objectFocus,this.objectFocusAction)
      if (this.objectFocus != 0) {
        if (this.objectFocusAction == 'autoplay') if (this.objectFocus.properties.video != undefined) this.objectFocus.properties.video.play();
      }
    }

  }

  class APP_PorcelainARUI {
    constructor() {
      this.init();
    }

    init() {
      APP.UI = {};
      APP.UI.data = {};
      APP.UI.data.Height = 0;
      APP.UI.data.Width = 0;
      APP.UI.data.Depth = 0;
      APP.UI.data.HeightDefault = 0;
      APP.UI.data.WidthDefault = 0;
      APP.UI.data.DepthDefault = 0;

      APP.UI.updateUI = function () {
        var height = document.getElementById('theight').value;
        var width = document.getElementById('twidth').value;
        var depth = document.getElementById('tdepth').value;
        if (height == '') APP.UI.data.Height = APP.UI.data.HeightDefault;else APP.UI.data.Height = height;
        if (width == '') APP.UI.data.Width = APP.UI.data.WidthDefault;else APP.UI.data.Width = width;
        if (depth == '') APP.UI.data.Depth = APP.UI.data.DepthDefault;else APP.UI.data.Depth = depth;
        APP.run.app.updateThing();
      };
    }

  }

  //import APP_UICarousel from '../ui/carousel/app-UICarousel';
  //import AKIT_ObjectARTypeCube from '../akit/object/ar/akit-ObjectARTypeCube';

  class APP_AR extends AKIT_ARApp {
    constructor() {
      super();
      AKIT.alogApp('app_app: (new)');
    }

    init() {
      this.initUI();
      this.initProperties();
      this.initApp();
      AKIT.alogApp('app_app: (ready)');
    }

    initUI() {
      this.ui = new APP_PorcelainARUI();
    }

    start() {} //load(id) {
    //  AKIT.alogApp('app_load: (load)');
    //  this.loadARPlatform(id);
    // }


    stop() {}

    cycle() {
      this.cycleAR(); // this.carousel.cycle();
    }

    eventDown() {}

    eventUp() {}

    eventDrag() {}

    eventHit(x, y, z) {
      let opts = {
        point: {
          x: x,
          y: y,
          z: z
        }
      };
      this.envMgr.setEnvEvent('place', 0, opts);
      console.log(opts);
    }

    objectData(olist) {
      //console.log(olist,APP.language)
      let t = olist.title;
      let d = olist.desc;
      let ft = olist.filetype;
      let tl = t[APP.language];
      let dl = d[APP.language];
      let data = {
        title: tl,
        description: dl,
        filetype: ft
      };
      return data;
    }

  }
  /*
  ngAfterViewInit() {
    // this.app3Service.init(0);

    console.log('ar view init 0');

    window.AKIT.devices.initMediaDevices(this);

    console.log('ar view init 1');
  }

  callbackDevices() {
    console.log('ar view callback');

    window.APP.run.canvasSet(this.canvas);

    this.setGroupData([]);
    this.init();
    this.start();

    this.setContentHeight();
    this.showHelp();
  }

  setContentHeight() {
    setTimeout(() => {
      const hh = this.footerElement.nativeElement.offsetHeight;
      this.footerHeight = hh;
      this.contentHeight = this.contentSlideHeight + this.footerHeight;
    }, 1000);
  }

  getContentStyle(): Object {
    return { position: 'absolute', width: '100%', bottom: this.contentHeight + 'px' };
  }

  ngOnDestroy() {
    this.app3Service.stop();
    this.app3Service.stopAR();
  }

  public init() {
    if (!this.app3Service.startedARCheck()) {
      this.app3Service.startAR('arjs');
      this.app3Service.cycleStart();
    }
    this.app3Service.loadAR();
  }

  public start() {
    this.app3Service.setSceneWindow();
    this.app3Service.setCanvas();
    this.app3Service.setElement();
    this.app3Service.start();
  }
  */

  class APP_run {
    constructor() {
      console.log('app run 0');
      APP.directory = window.location.pathname;
      AKIT.loader = new AKIT_AppLoader();
      AKIT.loader.add('spinner', {
        size: 1,
        len: 1,
        rotate: {
          x: -0.5,
          y: 0,
          z: 0
        }
      });
      AKIT.video = new AKIT_AppVideo();
      AKIT.env = new AKIT_AppEnv();
      this.objectStore = new AKIT_AppObjectStore();
      AKIT.initObjectStore();
      this.app = new APP_AR(); //  this.init();

      console.log('app run 1');
      AKIT.running = false;
    }

    init() {
      //  console.log('app run INIT');
      this.app.init();
    }

    start() {
      this.app.start(); //this.animate();

      AKIT.running = true;
      AKIT.alogKit('(app-start) ');
    }

    stop() {
      this.running = false;
      AKIT.alogKit(' (app-stop) ');
    }

    animate() {//  APP.renderer.setAnimationLoop(cycleRender);
    }

    scene() {}

    step() {
      setInterval(function () {
        cycleStep();
      }, 1000 / 29.97);
    }

    control() {
      AKIT.control = new AKIT_ObjectTypePlaneWorldControl3DRay(this.app, 2, 2, 8, 8);
      AKIT.control.init();
      AKIT.control.resize();
      AKIT.control.rotationXYZRadians(-0.5, 0, 0);
    }

    canvasSet(p) {
      AKIT.canvas = p;
    }

    parentSet(p) {
      this.parent = p;
    }

    resize() {
      this.app.resize();
    }

  }

  function cycleStep() {
    if (AKIT.running) {
      APP.run.app.cycle();
      AKIT.video.cycle();
    }
  }

  // import ClientJS from 'clientjs'
  class AKIT_AppDevices {
    constructor() {
      this.video = '';
      this.info = {
        device: '',
        os: '',
        browser: '',
        mediaDevices: 'ok'
      };
      this.mediaSrc = 0;
      this.deviceList = [];
      this.deviceSelected = false;
      this.startRoute = '/home';
    }

    deviceMsg(text, msg, al) {
      var msg1 = 'DEVICE:' + text + JSON.stringify(msg);
      console.log(msg1);
      if (al) alert(msg1);
    }

    deviceAlert(msg) {
      alert(msg);
    }

    deviceAction(action, msg) {
      if (action == 'redirect') {
        var mylink = APP.pages[msg];
        this.startRoute = mylink;
      }
    }

    setStartRoute(s) {
      this.startRoute = s;
    }

    getStartRoute() {
      return this.startRoute;
    }

    initInfoDevices() {
      this.infoDevice();
      this.infoDeviceMedia();

      if (APP.platformAR == 'arjs') {
        return this.infoDeviceActionsSet1();
      } else {
        return this.infoDeviceActionsSet2();
      }

      return false;
    }

    infoDeviceActionsSet1() {
      if (this.infoDeviceActions()) {
        this.infoDeviceParams();
        return true;
      }

      return false;
    }

    infoDeviceActionsSet2() {
      return true;
    }

    initMediaDevices(callback) {
      if (this.checkDeviceMedia()) {
        this.setDeviceMediaConstraints(callback, APP.mediaDevices.parameters); // if (this.mediaSrc!=-1)

        return true;
      }
    }

    checkDeviceReady() {
      if (this.mediaSrc == 0) return false;
      if (this.mediaSrc != -1) return true; //  this.deviceMsg('no device stream found:' + this.mediaSrc)

      return false;
    }

    infoDevice() {
      var client = new ClientJS(); // Create A New Client Object

      this.info.browser = client.getBrowser(); // Get Browser

      this.info.browserVersion = client.getBrowserMajorVersion(); // Get Browser

      this.info.engine = client.getEngine(); // Get Engine

      this.info.browsercn = this.checkChineseBrowser();
      this.info.osVersion = parseInt(client.getOSVersion());

      if (client.isMobile()) {
        // Check For Mobile Device
        this.info.device = 'mobile';

        if (client.isMobileAndroid()) {
          // Check For Android
          this.info.os = 'android';
        } else if (client.isMobileIOS()) {
          // Check For iOS
          this.info.os = 'ios';
          var isSafari = client.isSafari();

          if (isSafari) {
            this.info.browser = 'safari';
          }
        } else {
          this.info.os = 'other';
        }
      } else {
        this.info.device = 'desktop';

        if (client.isMobileIOS()) {
          this.info.os = 'ipad';
        }
      } // this.infoDeviceMedia()


      var infos = APP.platformAR + ' ' + JSON.stringify(this.info);
      this.deviceMsg('user info:' + infos, false);
    }

    infoDeviceActions() {
      // this.deviceAction('redirect','wechat');
      // return false;
      ///////////////////////////////////////////////////////////////SAFARI
      if (this.info.os == 'ios') {
        if (this.info.browser != 'safari') {
          if (this.info.browsercn == 'Wechat') {
            this.deviceAction('redirect', 'wechat'); // this.deviceAlert('This browser is not supported, please use "open in browser" in Wechat menu')
            //  this.deviceActionOpenBrowser();

            return false;
          } else {
            if (this.info.mediaDevices != 'ok') {
              var errInfo = 'This browser is not supported, please open in Safari. ' + this.info.mediaDevices;
              this.deviceAlert(errInfo);
            } else {
              var errInfo = 'This browser is not supported, please open in Safari. ';
              this.deviceAlert(errInfo);
            }

            return false;
          }
        }

        if (this.info.osVersion < 12) {
          var errInfo = 'You may encounter issues with this version of IOS, please upgrade your IOS version for best experience. Click to continue. ' + this.info.osVersion;
          this.deviceAlert(errInfo);
        } ///////////////////////////////////////////////////////////////ANDROID

      } else {
        if (this.info.browsercn == 'Wechat') {
          this.deviceAction('redirect', 'wechat'); // this.deviceAlert('This browser is not supported, please use "open in browser" in Wechat menu')

          return false;
        }

        if (this.info.mediaDevices != 'ok') {
          var errInfo = 'This browser is not supported, please open in Chrome, Firefox or other browser that supports WebRTC. ' + this.info.mediaDevices;
          this.deviceAlert(errInfo);
          return false;
        }
      }

      return true;
    }

    deviceActionOpenBrowser() {
      window.open(APP.host);
    }

    infoDeviceMedia() {
      // check API is available
      if (navigator.mediaDevices === undefined || navigator.mediaDevices.enumerateDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
        if (navigator.mediaDevices === undefined) var fctName = 'navigator.mediaDevices';else if (navigator.mediaDevices.enumerateDevices === undefined) var fctName = 'navigator.mediaDevices.enumerateDevices';else if (navigator.mediaDevices.getUserMedia === undefined) var fctName = 'navigator.mediaDevices.getUserMedia';
        this.info.mediaDevices = 'WebRTC error:' + fctName + ' not available';
      }
    }

    infoDeviceParams() {
      let params = '1';

      if (this.info.device == 'desktop') {
        APP.mediaDevices.parameters = APP.mediaDevices.parameters2;
        params = '2';
      }

      if (this.info.os == 'ios') {
        if (this.info.osVersion < 12) {
          APP.mediaDevices.parameters = APP.mediaDevices.parameters2;
          params = '2';
        }
      }

      this.deviceMsg('device params:' + params, '', false);
    } ///////////////////////////////////////////////////////////////////////////////


    checkDeviceMedia() {
      // check API is available
      if (navigator.mediaDevices === undefined || navigator.mediaDevices.enumerateDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
        if (navigator.mediaDevices === undefined) var fctName = 'navigator.mediaDevices';else if (navigator.mediaDevices.enumerateDevices === undefined) var fctName = 'navigator.mediaDevices.enumerateDevices';else if (navigator.mediaDevices.getUserMedia === undefined) var fctName = 'navigator.mediaDevices.getUserMedia';
        this.onError('WebRTC error:' + fctName + ' not available');
        return false;
      }

      return true;
    }

    setDeviceMediaConstraints(callback, parameters) {
      var userMediaConstraints = {
        audio: false,
        video: {
          facingMode: 'environment',
          width: {
            ideal: parameters.sourceWidth
          },
          height: {
            ideal: parameters.sourceHeight
          }
        }
      };
      this.setDeviceConstraints(callback, parameters, userMediaConstraints);
    }

    setDeviceMediaConstraintsId(callback, parameters, id) {
      var userMediaConstraints = {
        audio: false,
        video: {},
        deviceId: id
      };
      this.setDeviceConstraints(callback, parameters, userMediaConstraints);
    }

    setDeviceConstraints(callback, parameters, userMediaConstraints) {
      var _this = this;

      navigator.mediaDevices.enumerateDevices().then(function (devices) {
        _this.deviceDebug(_this, devices);

        if (null !== parameters.deviceId) {
          userMediaConstraints.video.deviceId = {
            exact: parameters.deviceId
          };
        }

        navigator.mediaDevices.getUserMedia(userMediaConstraints).then(function success(stream) {
          _this.deviceMsg('stream:', stream, false);

          _this.setDeviceStream(stream);

          _this.deviceSuccess(callback); //  _this.deviceListCheck();
          //   _this.deviceMsg('set device stream:', stream)

        }).then(() => _this.deviceListCheck());
      });
      /*
            .catch(function(error) {
              _this.setDeviceStream(-1);
          //    _this.onError({
          //      name: error.name,
          //      message: error.message
          //    });
            });
        })
        .catch(function(error) {
          _this.setDeviceStream(-1);
      //    _this.onError({
      //      message: error.message
        //  });
      });*/
    }

    setDeviceStream(s) {
      this.mediaSrc = s;
    }

    deviceDebug(parent, devices) {
      // this.deviceMsg('device no:', devices.length)
      parent.deviceList = [];

      for (var i = devices.length - 1; i >= 0; i--) {
        if (devices[i].kind === 'videoinput') {
          var vd = devices[i];
          var did = devices[i].deviceId;
          this.deviceMsg('device' + i + ':', vd, false);
          parent.deviceList.push(did);
        }
      }
    }

    deviceSuccess(callback) {
      this.deviceSelected = true;
      callback.callbackDevices();
    }

    deviceListCheck() {
      //    console.log(this.deviceList, this.deviceSelected);
      this.deviceMsg('device ids', this.deviceList + ' ' + this.deviceSelected, false);

      if (!this.deviceSelected) {
        var did = this.deviceList[0];
        this.deviceSelected = true;
        this.setDeviceMediaConstraintsId(APP.mediaDevices.parameters, did);
      }
    }

    onError(msg) {
      //   var msg1 = JSON.stringify(msg);
      var errHandling = false;
      var name = msg['name'];

      if (name != undefined) {
        if (this.errorHandling(name)) errHandling = true;
      }

      if (!errHandling) this.deviceMsg('device error:', msg, true); //   alert(msg1);
    }

    errorHandling(etype) {
      if (etype == 'NotAllowedError') {
        if (this.info.os == 'ios') {
          if (this.info.browser == 'safari') {
            this.deviceAlert('Please turn on "Camera & Microphone Access" in Settings > Safari and reload app.');
            return true;
          }
        }
      }

      return false;
    }

    checkChineseBrowser() {
      var browserName = 'Other';
      var ua = window.navigator.userAgent;
      var browserRegExp = {
        Sogou: /SE\s2\.X|SogouMobileBrowser/,
        Explorer2345: /2345Explorer|2345chrome|Mb2345Browser/,
        Liebao: /LBBROWSER/,
        Wechat: /MicroMessenger/,
        QQBrowser: /QQBrowser/,
        Baidu: /BIDUBrowser|baidubrowser|BaiduHD/,
        UC: /UBrowser|UCBrowser|UCWEB/,
        MiuiBrowser: /MiuiBrowser/,
        MobileQQ: /Mobile\/\w{5,}\sQQ\/(\d+[\.\d]+)/,
        Shoujibaidu: /baiduboxapp/,
        SamsungBrowser: /samsungbrowser/,
        Firefox: /Firefox/,
        Maxthon: /Maxthon/,
        Se360: /360SE/,
        Ee360: /360EE/,
        TheWorld: /TheWorld/,
        Weibo: /__weibo__/,
        NokiaBrowser: /NokiaBrowser/,
        Opera: /Opera|OPR\/(\d+[\.\d]+)/,
        Edge: /Edge/,
        QQLive: /QQLive(HD)?Browser/,
        Letv: /LetvClient/,
        Youku: /Youku/,
        AndroidBrowser: /Android.*Mobile\sSafari|Android\/(\d[\.\d]+)\sRelease\/(\d[\.\d]+)\sBrowser\/AppleWebKit(\d[\.\d]+)/i,
        IE: /Trident|MSIE/,
        toutiao: /NewsArticle/,
        Chrome: /Chrome|CriOS/,
        Safari: /Version[|\/]([\w.]+)(\s\w.+)?\s?Safari|like\sGecko\)\sMobile\/\w{3,}$/
      };

      for (var i in browserRegExp) {
        if (browserRegExp[i].exec(ua)) {
          browserName = i;
          break;
        }
      }

      return browserName;
    } ///////////////////////////////////////////


    setDevice(parent, parameters, domElement) {
      var _this = this; // get available devices


      navigator.mediaDevices.enumerateDevices().then(function (devices) {
        var userMediaConstraints = {
          audio: false,
          video: {
            facingMode: 'environment',
            width: {
              ideal: parameters.sourceWidth // min: 1024,
              // max: 1920

            },
            height: {
              ideal: parameters.sourceHeight // min: 776,
              // max: 1080

            }
          }
        };

        if (null !== parameters.deviceId) {
          userMediaConstraints.video.deviceId = {
            exact: parameters.deviceId
          };
        } // get a device which satisfy the constraints


        navigator.mediaDevices.getUserMedia(userMediaConstraints).then(function success(stream) {
          // set the .src of the domElement
          domElement.srcObject = stream; // to start the video, when it is possible to start it only on userevent. like in android

          document.body.addEventListener('click', function () {
            domElement.play();
          }); // domElement.play();
          // TODO listen to loadedmetadata instead
          // wait until the video stream is ready

          var interval = setInterval(function () {
            if (!domElement.videoWidth) return;
            parent.onReady();
            clearInterval(interval);
          }, 1000 / 50);
        }).catch(function (error) {
          _this.onError({
            name: error.name,
            message: error.message
          });
        });
      }).catch(function (error) {
        _this.onError({
          message: error.message
        });
      });
      return domElement;
    }

    deviceDebug1() {
      var _this = this;

      if (APP.debug != null) {
        /// APP.debug['devices'] = {};
        APP.debug.devices['video'] = {};
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
          let videodev = []; //  var backVideoInputId = false

          for (var i = devices.length - 1; i >= 0; i--) {
            if (devices[i].kind === 'videoinput') {
              //  backVideoInputId = devices[i].deviceId;
              //  console.log(devices[i]);
              var vd = devices[i].label; //  console.log(vd)
              videodev.push(devices[i]); //  _this.addDebug(videolist,devices[i]);
            }
          } ////   APP.debug.devices = videodev;
          // _this.video = videolist;

        }).catch(function (error) {
          _this.onError({
            message: error.message
          });
        });
      } // let dinfo = APP.debug.devices['video'];

      /*  var devices = APP.debug.devices
        console.log(devices)
        for (var i = devices.length - 1; i >= 0; i--) {
          console.log(devices[i])
        }*/
      //  AKIT.alogKit('(debug-info-devices) ' + this.video);


      console.log(APP.debug.devices);
    }

    addDebug(videolist, device) {
      console.log(videolist);
      console.log(device);
    }

  }

  window.APP = {};
  window.AKIT = {};
  class APP_start {
    constructor() {
      this.host = window.APP.host;
      this.objdir = window.APP.objDir;
      this.aframe = new AKIT_AppAFrame();
      this.properties();
      window.AKIT.devices = new AKIT_AppDevices();
      window.APP.run = new APP_run(); // this.canvas);
    }

    properties() {
      APP.platformAR = AKIT_PROPS.platform;

      if (APP.platformAR == 'arjs') {
        this.markers();
        APP.arjs.cameraParametersUrl = AKIT_PROPS.arjs.cameraParametersUrl;
      } else if (APP.platformAR == '8wall') {
        this.load8wall();
        this.targets();
      }

      console.log('akit-aframe (properties):', AKIT_PROPS, APP, APP.arjs.cameraParametersUrl);
    } //////////////////////////////////////////////platform


    load8wall() {
      console.log('load8wall');
      var w8 = AKIT_PROPS['8wall'];
      var key8w = '//apps.8thwall.com/xrweb?appKey=' + w8.key;
      w8.keyurl = key8w;

      window.loadJS = function (url, location) {
        var scriptTag = document.createElement('script');
        scriptTag.addEventListener('load', function (event) {// APP.run.app.load();
        });
        scriptTag.src = url;
        location.appendChild(scriptTag);
      };

      window.load = () => {//  XRExtras.Loading.showLoading({ onxrloaded });
      };

      window.onload = () => {
        AKIT.loadedAR = true;
        console.log('loaded JS');
        AKIT.sceneAR.load(); //window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load);
      };

      window.onxrloaded = function () {};
    }

    targets() {} //  { name: '1', marker: 'pattern-marker.patt', scheme: markerScheme },


    markers() {
      //  console.log(AKIT_PROPS.markers)
      let inlist = AKIT_PROPS.markers;
      let mlist = [];

      for (let i = 0; i < inlist.length; i++) {
        let marker = inlist[i];
        let mprops = {};
        mprops.name = marker.name;
        mprops.scheme = 'objectPerMarker';

        if (marker['url'] != undefined) {
          mprops.marker = marker['url']; //  mprops.url=marker['url']
        } else {
          mprops.marker = marker.name + ".patt";
        }

        mlist.push(mprops);
      }

      APP.markers = mlist;
      console.log(APP.markers);
    } ///


    init() {
      console.log('akit-start init'); //   window.APP.run.parentSet(this);

      this.initKit();
      this.startKit();
    }

    start() {
      console.log('akit-start start');
      this.startAR();
    }

    cycle() {
      if (AKIT.running) {
        //  AKIT.scene.render();
        APP.run.app.cycle(); //  AKIT.video.cycle();
      }
    }

    initKit() {
      window.APP.run.parentSet(this);
      window.APP.run.init(); ///
      //  this.aframe.init();
      //  this.devices();
    }

    startKit() {
      //  this.aframe.set();
      this.setAR();
      this.callAR();
    }

    stop() {
      window.APP.run.stop();
    }

    load(id) {
      window.APP.run.load(id);
    }

    cycleStart() {
      if (!this.running) {
        this.running = true; //    window.APP.run.step();
        //    window.APP.run.animate();
        //     console.log('cycleStart');
      }
    } /////////////////////////////////////////////////////////////////


    devices() {// this.setAR();
      //   this.callAR()
    }

    call(msg, d) {} //  if (this.data[msg] === undefined) {
    //    this.data[msg] = new BehaviorSubject<Object>({});
    //  }
    //  const data = {};
    ///  data[msg] = d;S
    //    this.data[msg].next(data);
    ///////////////////////////////////////////////////////////////////////////AR


    setAR() {
      window.AKIT.devices.initMediaDevices(this);
    }

    callbackDevices() {
      console.log('ar view callback'); //   this.aframe.init();
    }

    startAR() {
      APP.sourceAR = document.getElementById('appscene'); //  console.log('akit-start startAR ' + APP.sourceAR);

      this.startARPlatform(); //    this.domElement.style.position = 'absolute';
      //    this.domElement.style.top = '0px';
      //    this.domElement.style.left = '0px';
      //    this.domElement.style.zIndex = '-2';

      console.log('start-source', APP.sourceAR);
    }

    callAR() {
      console.log('ar view call'); //  window.APP.run.canvasSet(this.canvas);
      //  this.setGroupData([]);

      this.initARPlatform(); //  this.startARPlatform();
      //  this.setContentHeight();
      //  this.showHelp();
    }

    initARPlatform() {
      if (!this.startedARCheck()) {
        window.APP.run.app.startAR(APP.platformAR);
        this.cycleStart();
      }

      this.loadAR();
    }

    startARPlatform() {
      //  this.setSceneWindow();
      //  this.setCanvas();
      this.setElement(); //  this.start();

      window.APP.run.start();
    } // vr.display() {  window.APP.run.app.vr.display(); }


    startedARCheck() {
      return window.APP.run.app.startedARCheck();
    }

    loadAR() {
      window.APP.run.app.loadAR();
    }

    stopAR() {
      window.APP.run.app.stopAR();
    } ////////////////////////////////////////////////////////////VR


    startedVRCheck() {
      return window.APP.run.app.startedVRCheck();
    }

    loadVR() {
      window.APP.run.app.loadVR();
    }

    startVR(platform) {
      window.APP.run.app.startVR(platform);
    }

    stopVR() {
      window.APP.run.app.stopVR();
    } ///////////////////////////////////////////////////settings


    setSceneWindow() {
      window.APP.run.app.setSceneWindow();
    }

    setElement() {
      window.APP.run.app.setElement1();
    }

    setCanvas() {
      window.APP.run.app.setCanvas1();
    }

    setVideoElement() {
      window.APP.run.app.setVideoElement();
    } ///////////////////////////////////////////////////////// OBJECTS


    objectAnchor(n, grp, m, obj) {
      // objectAnchor(name,group,marker,obj);
      //  console.log('anchor',name,marker,self)
      let objA = {
        "name": n,
        "group": grp,
        //    "dir": dir,
        //    "filetype": filetype,
        "object": obj,
        "marker": m,
        "title": "",
        "desc": ""
      };
      window.APP.run.app.objectAnchor(objA);
    }

    object(name, group, dir, marker, filetype, title, desc) {
      console.log('obj', name, group, dir, marker, filetype, title, desc);
      let obj = {
        "name": name,
        "group": group,
        "dir": dir,
        "filetype": filetype,
        "marker": marker,
        "title": title,
        "desc": desc
      };
      window.APP.run.app.object(obj);
    }

    loadObjects(id) {
      return window.APP.run.app.objectsLoad(id);
    }

    setObjects(filename, directory) {
      const url = this.host + directory + filename + '.json';
      const o = this.getURL(url);
      console.log(o);
      /*    const o = this.http.get<any[]>(url);
            o.subscribe(response => {
            // console.log(response);
            window.APP.run.app.objects(response);
          });*/
    }

    objects(grp, code) {
      console.log('objs', grp, code); //    if (this.loadObjects(grp)) {
      // const dir = '/assets/model/' + 'group' + code + '/';
      //    const dir = this.objdir + 'group' + code + '/';
      //      this.setObjects('data', dir);
      //    }
    } //////////////////////////////////////////////////////url


    getURL(url) {
      return url;
    } //////////////////////////////////////////////// DATA


    triggerUpdated(update) {
      console.log('triggerUpdated', update); //    this.triggerUpdateSubject.next(update);
    }

    triggerUpdatedMarker(update) {
      console.log('triggerUpdatedMarker', update); //    this.triggerUpdateMarkerSubject.next(update);
    }

    markerVisibleUpdated(update) {
      console.log('markerVisibleUpdated', update); //    this.markerVisibleSubject.next(update);
    }

  }

  ///// assimilate kit (akit) - assimilate interactive, Dr Damian Hills, damski@gmail.com - LICENSE: https://spdx.org/licenses/MIT.html
  window.akit = new APP_start();

}());
