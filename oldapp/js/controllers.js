angular.module('starter.controllers', [ 'ngStorage' ,'chart.js'])

.controller('DriverCtrl', function($scope, Drivers, Datum, Series, $ionicModal) {

  $scope.drivers = Drivers.all();

  $ionicModal.fromTemplateUrl('templates/modalDriver.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.createDriver = function(driver) {      
    $scope.calTS(driver);          
  };

  $scope.remove = function(driver) {
    Drivers.remove(driver);
  };

  //Calculate Driver Param
  $scope.calTS = function(driver) {

    var pi = 3.14;
    var ro = 1.18;
    var c = 345;

    if(driver.size == 6){
      driver.sd = 125;
    }
    if(driver.size == 6){
      driver.sd = 165;
    }
    if(driver.size == 8){
      driver.sd = 220;
    }
    if(driver.size == 10){
      driver.sd = 220;
    }
    if(driver.size == 12){
      driver.sd = 530;
    }
    if(driver.size == 15){
      driver.sd = 890;
    }
    if(driver.size == 18){
      driver.sd = 1300;
    }

    driver.dd3 = Math.round(100 *(Math.pow(((driver.size-1)/3), 2) * 3.14) * (driver.size / 2) * 0.016) / 100;

    driver.recSealedVb = 0;
    driver.recSealedFb = 0;
    driver.recPortedVb = 20 * driver.vas * (Math.pow( driver.qts , 3.3));
    driver.recPortedVb = (Math.round(100 * driver.recPortedVb))/ 100;
    driver.recPortedF3 = Math.pow((driver.vas/driver.recPortedVb), 0.44) * driver.fs;
    driver.recPortedF3 = (Math.round(100 * driver.recPortedF3))/ 100;
    driver.recPortedFb = Math.pow((driver.vas/driver.recPortedVb), 0.31) * driver.fs;
    driver.recPortedFb = (Math.round(100 * driver.recPortedFb))/ 100;
    
    driver.ebp = driver.fs / driver.qes;
    driver.qts =  1/((1/driver.qms) + (1/driver.qes));
    driver.vd = (driver.sd*driver.xmax)/10;
    driver.n0 = 9.64 * Math.pow(10, -10) * Math.pow(driver.fs, 3) * driver.vas/driver.qes;
    driver.spl = 112 + 10 * Math.log10(driver.n0);
    driver.k1 = (4 * Math.pow(pi, 3) * ro / c) * Math.pow(driver.fs, 4) * Math.pow((driver.vd/1000000), 2);
    driver.k2 = 112 + 10 * Math.log10(driver.k1);
    driver.par = 3 * Math.pow(driver.recPortedF3, 4) * Math.pow(driver.vd, 2);
    driver.per = driver.par / driver.n0;
    driver.peakSPL = driver.spl + 10 * Math.log10(driver.rms);   
    driver.brandModel = driver.brand + ' : ' + driver.model;
    
    Drivers.add(driver);
    $scope.modal.hide();
    console.log(driver);
  };
})

.controller('DriverDetailCtrl', function($scope, $stateParams, Drivers, Datum, Series, $state) {
  $scope.driver = Drivers.get($stateParams.driverId);  

  $scope.editDriver = function(driver) {
    Drivers.edit(driver);
    $state.go('tab.driver');
  };

  $scope.displacement = function(driver) {
    console.log("hello");

    if(driver.size == 6){
      driver.sd = 125;
    }
    if(driver.size == 6){
      driver.sd = 165;
    }
    if(driver.size == 8){
      driver.sd = 220;
    }
    if(driver.size == 10){
      driver.sd = 220;
    }
    if(driver.size == 12){
      driver.sd = 530;
    }
    if(driver.size == 15){
      driver.sd = 890;
    }
    if(driver.size == 18){
      driver.sd = 1300;
    }

    driver.dd3 = Math.round(100 *(Math.pow(((driver.size-1)/3), 2) * 3.14) * (driver.size / 2) * 0.016) / 100;
  };

  //Calculate Driver Param
  $scope.calTS = function(driver) {

    var pi = 3.14;
    var ro = 1.18;
    var c = 345;    

    driver.recSealedVb = 0;
    driver.recSealedFb = 0;
    driver.recPortedVb = 20 * driver.vas * (Math.pow( driver.qts , 3.3));
    driver.recPortedVb = (Math.round(100 * driver.recPortedVb))/ 100;
    driver.recPortedF3 = Math.pow((driver.vas/driver.recPortedVb), 0.44) * driver.fs;
    driver.recPortedF3 = (Math.round(100 * driver.recPortedF3))/ 100;
    driver.recPortedFb = Math.pow((driver.vas/driver.recPortedVb), 0.31) * driver.fs;
    driver.recPortedFb = (Math.round(100 * driver.recPortedFb))/ 100;
    
    driver.ebp = driver.fs / driver.qes;
    driver.qts =  1/((1/driver.qms) + (1/driver.qes));
    driver.vd = (driver.sd*driver.xmax)/10;
    driver.n0 = 9.64 * Math.pow(10, -10) * Math.pow(driver.fs, 3) * driver.vas/driver.qes;
    driver.spl = 112 + 10 * Math.log10(driver.n0);
    driver.k1 = (4 * Math.pow(pi, 3) * ro / c) * Math.pow(driver.fs, 4) * Math.pow((driver.vd/1000000), 2);
    driver.k2 = 112 + 10 * Math.log10(driver.k1);
    driver.par = 3 * Math.pow(driver.recPortedF3, 4) * Math.pow(driver.vd, 2);
    driver.per = driver.par / driver.n0;
    driver.peakSPL = driver.spl + 10 * Math.log10(driver.rms);  
    driver.brandModel = driver.brand + ' : ' + driver.model; 

    console.log(driver);
  };

  //calls calTS when the Controller Loads
  $scope.calTS($scope.driver);
})
.directive('barSelect',function($parse){
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      value: '=barSelect'
    },
    link: function(scope, element, attrs, ngModelCtrl){
      element.addClass('button');
      element.on('click', function(e){
        scope.$apply(function(){
          ngModelCtrl.$setViewValue(scope.value);
        });
      });
      
      scope.$watch('model', function(newVal){
        element.removeClass('active');
        if (newVal === scope.value){
          element.addClass('active');
        }
      });
    }
  };
})

.controller('DesignCtrl', function($scope, $state, Designs, Drivers, Types, $ionicModal, $location) {  

  $scope.designs = Designs.all();
  $scope.drivers = Drivers.all();
  $scope.types = Types.all();

  //updates driver data in design array
  angular.forEach($scope.designs, function(key,value) { 
    key.driver = Drivers.get(key.driverID);
  });  

  $ionicModal.fromTemplateUrl('templates/modalDesign.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.createDesign = function(design) {
    design.bracing = new Object();
    design.bracing.cm = 2.54;
    design.bracing.in = 1;
    design.box = new Object();
    design.box.depth = new Object();
    design.box.height = new Object();
    design.box.width = new Object();
    //design.depth = new Object();
    design.dmin = new Object();
    design.dmin.actual = new Object();
    design.dmin.rec = new Object();
    design.dmin.outer = new Object();
    //design.dminRec = new Object();
    //design.dminOuter = new Object();
    //design.ib = new Object();
    design.id = (new Date()).getTime();    
    //design.height = new Object();
    design.lv = new Object();
    design.nod = 1; 
    design.np = 1;     
    //design.portAreaRec = new Object();    
    //design.portArea = new Object();
    design.port = new Object();
    design.port.area = new Object();
    design.port.height = new Object();
    design.port.width = new Object();
    design.splData = {'dataset' : []};  
    design.type = "Ported";
    //design.width = new Object();
    Designs.add(design);
    $scope.modal.hide();
    //takes you to the new driver desing where you can choose a driver
    $location.path('/tab/design/' + design.id );
  };

  $scope.remove = function (design) {
    Designs.remove(design);
  };
})

.controller('DesignDetailCtrl', function($scope, $stateParams, Designs, Drivers, Types, $state) {
  $scope.drivers = Drivers.all();
  $scope.designs = Designs.all();
  $scope.design = Designs.get($stateParams.designId);
  $scope.types = Types.all();

  console.log($scope.design);

  $scope.editDesign = function(design) {
    Designs.edit(design);
    $state.go('tab.design');
  };  

  $scope.ShowUS = function() {
    $scope.settings[0].metric = false;
    //console.log($scope.settings[0].metric)
  };   

  $scope.ShowMetric = function() {
    $scope.settings[0].metric = true;
    //console.log($scope.settings[0].metric)
  };   

  $scope.addDriver = function(design) {
    design.driver = Drivers.get(design.driverID);

    //Initialize Driver when a new design is created and there are no
    //values for the box parameters
    if(!design.vb){
      design.vb = design.driver.recPortedVb;
    }
    if(!design.fb){
      design.fb = design.driver.recPortedFb;
    }
    $scope.calPort(design);
  };

  $scope.driverSelect = [1,2,3,4,5,6,7,8];
  $scope.portSelect = [1,2,3,4,5,6,7,8];

  //Converts port Dimensions to Centimeteres
  $scope.PortToCm = function(design) {
    design.dmin.actual.cm = design.dmin.actual.in * 2.54;
    design.port.width.cm = design.port.width.in * 2.54;
    design.port.height.cm = design.port.height.in * 2.54;
    $scope.calPort(design);
  };

  //Converts port Dimensions to Inches
  $scope.PortToIn = function(design) {
    //design.dmin.actual.in = (Math.round(100 * (design.dmin.actual.cm / 2.54)))/ 100;
    //design.port.width.in = (Math.round(100 * (design.port.width.cm / 2.54)))/ 100;
    //design.port.height.in = (Math.round(100 * (design.port.height.cm / 2.54)))/ 100;
    $scope.calPort(design);
  };

  $scope.PortAreaIn = function(design) {
    //design.port.height.cm = design.port.height.in * 2.54;
    //design.port.area.cm = design.port.height.cm * design.port.width.cm;
    //design.dmin.actual.cm = Math.sqrt((design.port.area.cm / 3.14) / 2);
    //design.dmin.actual.in = design.dmin.actual.cm / 2.54;
    $scope.calPort(design);
  };

  //Port Calculations
  $scope.calPort = function(design) {      

    //Dmin = Port Diameter----------------------
    design.dmin.rec.cm = Math.round(10000 * ((20.30 * (Math.pow((Math.pow((design.driver.vd/1000000*design.nod), 2) / design.fb), 0.25)))/ Math.sqrt(design.np)))/100;
    design.dmin.rec.in = (Math.round(100 * (design.dmin.rec.cm * 0.393701)))/ 100;
    if(!design.dmin.actual.cm){
      design.dmin.actual.cm = design.dmin.rec.cm;
      design.dmin.actual.in = design.dmin.rec.in;
    }    
    //design.portAreaRec.cm = 3.14 * (Math.pow((design.dmin.rec.cm/2), 2 ));
    design.port.area.cm = Math.round(100 * (3.14 * (Math.pow((design.dmin.actual.cm/2), 2 )))) / 100;
    design.port.area.in = Math.round(100 * (3.14 * (Math.pow((design.dmin.actual.in/2), 2 )))) / 100;
    
    if(!design.port.width.cm){
      design.port.width.cm = design.driver.size * 2.54;  
      design.port.width.in = design.driver.size;       
    }
    design.port.height.cm = Math.round(100 * (design.port.area.cm / design.port.width.cm)) / 100;
    design.port.height.in = Math.round(100 * (design.port.area.in / design.port.width.in)) / 100;
    design.dmin.outer.cm = design.dmin.actual.cm;
    design.dmin.outer.in = design.dmin.actual.in;

    //Bracing is set to default at 1 inch
    design.bracing.cm = 2.54

    //recalculate ts based on multi driver setup
    var pi = 3.14;
    var ro = 1.18;
    var c = 345;

    design.vd = (design.driver.sd * design.nod * design.driver.xmax)/10;
    design.n0 = 9.64 * Math.pow(10, -10) * Math.pow(design.driver.fs, 3) * (design.driver.vas * design.nod)/design.driver.qes;
    design.spl = 112 + 10 * Math.log10(design.n0);
    design.k1 = (4 * Math.pow(pi, 3) * ro / c) * Math.pow(design.driver.fs, 4) * Math.pow((design.vd/1000000), 2);
    design.k2 = 112 + 10 * Math.log10(design.k1);
    design.par = 3 * Math.pow(design.driver.recPortedF3, 4) * Math.pow(design.vd, 2);
    design.per = design.par / design.n0;
    design.peakSPL = design.spl + 10 * Math.log10(design.driver.rms * design.nod); 

    //Port length Calculation = lv
    design.lv.cm = (23562.5 * Math.pow(design.dmin.actual.cm, 2) * design.np / (design.vb * Math.pow(design.fb, 2))) - (design.dmin.actual.cm * .732);
    design.lv.in = (Math.round(100 * (design.lv.cm * 0.393701)))/ 100;
    //placed after the cm to in conversion to increase accuracy
    design.lv.cm = (Math.round(100 * design.lv.cm))/ 100;

    design.A = Math.pow((design.fb/design.driver.fs), 2); 
    design.B = design.A/design.driver.qts + design.fb/(7*design.driver.fs);
    design.C = 1 + design.A + (design.driver.vas * design.nod/design.vb) + (design.fb / (design.driver.fs * design.driver.qts * 7));
    design.D = 1/design.driver.qts + design.fb/(design.driver.fs * 7); 
    design.E = (97/49) * design.A;    
    $scope.calPlot(design);
  };

  $scope.calPlot = function(design) {  
    var labels = [];
    var dataset = [];

    //for( var i = 10; i < 500; i = i + Math.log(i)){  
    for( var i = 10; i < 500; i = Math.round(i * 1.1)){    
    //for( var i = 10; i < 500; i++){      
      //console.log(Math.round(200*(i * .55))/100);
      
      //if(i>40){
      //  i++;
      //}
      //if(i>80){
      //  i++;
      //}
      //if(i>100){
      //  i=i+3;
      //}
      //if(i>200){
      //  i=i+5;
      //}

      var F = i; 
      labels.push(i);     
      var Fn2 = Math.pow((F/design.driver.fs), 2);
      //console.log("Fn2 " +Fn2);
      var Fn4 = Math.pow(Fn2, 2); 
      //console.log("Fn4 " + Fn4);
      var dBmag = 10 * Math.log10(Math.pow(Fn4, 2)/(Math.pow((Fn4-design.C*Fn2+design.A), 2)+Fn2*Math.pow((design.D*Fn2-design.B),2)));
      //console.log("DBMag " + dBmag);
      var Pmax = (design.k1/design.n0)*(Math.pow((Fn4-design.C*Fn2+design.A), 2) + Fn2*Math.pow((design.D*Fn2-design.B), 2))/(Fn4-design.E*Fn2+Math.pow(design.A,2));
      //console.log("Pmax " + Pmax);
      var SPLmax = design.k2 + 10 * Math.log10(Math.pow(Fn4, 2) /(Fn4 - design.E * Fn2 + Math.pow(design.A,2 ))); 
      //console.log("SPLmax " + SPLmax);
      var SPLtherm = design.peakSPL + dBmag;
      //console.log("Hertz " + i + " : db " + SPLtherm );
      dataset.push({x: F, y: (Math.round(100 * Math.min(SPLmax, SPLtherm)))/ 100});
    }

    design.splData = [ dataset ];
    $scope.calBox(design);
  };

  //Calculate Box Dimensions
  $scope.BoxToCm = function(design) {
    design.dmin.outer.cm = design.dmin.outer.in * 2.54;
    design.bracing.cm = design.bracing.in * 2.54;
    design.box.width.cm = design.box.width.in * 2.54;
    design.box.height.cm = design.box.height.in * 2.54;
    $scope.calBox(design);
  };

  $scope.BoxToIn = function(design) {
    //design.dmin.outer.in = design.dmin.outer.cm / 2.54;
    //design.bracing.in = design.bracing.cm / 2.54;
    //design.box.width.in = design.box.width.cm / 2.54;
    //design.box.height.in = design.box.height.cm / 2.54;
    //$scope.calBox(design);
  };

  $scope.calBox = function(design) {     
    if(!design.box.width.cm){
      design.box.width.cm = design.driver.size * 2.54 + 2;
      design.box.width.in = design.driver.size * 1 + 2;
    }
    if(!design.box.height.cm){
      design.box.height.cm = design.driver.size * 2.54 + 2;
      design.box.height.in = design.driver.size * 1 + 2;
    }
    design.box.depth.cm = (design.lv.cm * design.np * design.dmin.outer.cm + 8 * design.bracing.cm * design.box.width.cm + 4 * design.bracing.cm * design.box.height.cm + 1000 * design.driver.dd3 * design.nod - (16 * Math.pow(design.bracing.cm, .33333)) + 1000 * design.vb) / (design.box.width.cm * design.box.height.cm);
    design.box.depth.in = (Math.round(100 * design.box.depth.cm / 2.54)) / 100;
    design.box.depth.cm = (Math.round(100 * design.box.depth.cm)) / 100;
  };

  //Chart Code  
  $scope.series = ['Driver Box Model'];
  $scope.colors = [{
    fill: false,
    borderColor: "#000000",
    backgroundColor: "#000000"  
  }];
  $scope.options = {
    elements: {
      point: {
        radius: 1.5
      } 
    },
    scales: {
      xAxes: [{
        id: 'x-axis-1',
        type: 'logarithmic',
        display: true,
        position: 'bottom',
        scaleLabel: {
          display: true,
          labelString: 'Frequency'
        },
        ticks: {                          
          userCallback: function(tick) {
            var remain = tick / (Math.pow(10, Math.floor(Chart.helpers.log10(tick))));
            if (remain === 1) {
              var test = tick.toString();
              if(test >= 1000 && test < 1000000){
                  return tick/1000 + "kHz";
              }else if(test >= 1000000 && test < 1000000000){
                  return tick/1000000 + "MHz";
              }else if(test >= 1000000000){
                  return tick/1000000000 + "GHz";
              }else {
                  return tick.toString() + "Hz";
              }
            }
            return '';
          }
        }
      }],
      yAxes: [{
        id: 'y-axis-1',
        type: 'linear',
        display: true,
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'DB'
        },
      }]    
    }
  };  
})

.controller('SimCtrl', function($scope, Datum, Series, Designs) {

  $scope.designs = Designs.all();
  $scope.datum = Datum.all();
  $scope.series = Series.all();  

  //console.log($scope.datum);

  $scope.toggleSim = function (design) {
    Designs.edit(design);
    Datum.clear();
    Series.clear();

    angular.forEach($scope.designs, function(design,value) { 
      if(design.sim){   
        Datum.add(design.splData[0]);
        Series.add(design.name);           
      }
    }); 

    $scope.datum = Datum.all();
    $scope.series = Series.all(); 
  };
  
  $scope.colors = [{
    fill: false,
    borderColor: "#ff0000",
    backgroundColor: "#ff0000"   
  },{
    fill: false,
    borderColor: "#ff9400",
    backgroundColor: "#ff9400"
  },{
    fill: false,
    borderColor: "#778fff",
    backgroundColor: "#778fff"
  },{
    fill: false,
    borderColor: "#77ff90",
    backgroundColor: "#77ff90"
  },{
    fill: false,
    borderColor: "#ffa100",
    backgroundColor: "#ffa100"
  },{
    fill: false,
    borderColor: "#ff00e1",
    backgroundColor: "#ff00e1"
  },{
    fill: false,
    borderColor: "#ffe500",
    backgroundColor: "#ffe500"
  },{
    fill: false,
    borderColor: "#00ffed",
    backgroundColor: "#00ffed"
  }];
  $scope.options = {
    elements: {
      point: {
        radius: 1.5
      }
    },
    legend: {display: true},
    scales: {
      xAxes: [{
        id: 'x-axis-1',
        type: 'logarithmic',
        display: true,
        position: 'bottom',
        scaleLabel: {
          display: true,
          labelString: 'Frequency'
        },
        ticks: {                          
          userCallback: function(tick) {
            var remain = tick / (Math.pow(10, Math.floor(Chart.helpers.log10(tick))));
            if (remain === 1) {
              var test = tick.toString();
              if(test >= 1000 && test < 1000000){
                  return tick/1000 + "kHz";
              }else if(test >= 1000000 && test < 1000000000){
                  return tick/1000000 + "MHz";
              }else if(test >= 1000000000){
                  return tick/1000000000 + "GHz";
              }else {
                  return tick.toString() + "Hz";
              }
            }
            return '';
          }
        }
      }],
      yAxes: [{
        id: 'y-axis-1',
        type: 'linear',
        display: true,
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'DB'
        },
      }]    
    }
  };
});
