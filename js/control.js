/* -------------------------------------------------------------------------- */
/* ---------------------------------- INIT ---------------------------------- */
/* -------------------------------------------------------------------------- */
/* INIT MAP */
var map = kartograph.map("#map", 650, 650);
console.log("map initialized");

/* INIT MANAGER */
var manager = new Manager(map, "states");
console.log("manager initialized");

/* INIT COLORS */
var C_bg_fill = "#FFF9E8";
var C_bg_stroke = "#4C4C4C";
var C_fg_stroke = "#FF0000";
var C_pool = ["#ff7f00", "#984ea3", "#4daf4a", "#377eb8"];
var C_bg_width = "1px";
var C_fg_width = "3px";
manager.initColors(C_pool,C_bg_fill,C_bg_stroke,C_fg_stroke,C_bg_width, C_fg_width);
console.log("colors set");

/* LOAD MAP */
map.loadMap('svg/spain.svg', function() {

  /* ADD LAYER */
  map.addLayer('states', {
    name: 'states',
    key: 'states',
    styles: {
      fill: C_bg_fill,
      stroke: C_bg_stroke
    },
    title: function(data) {
      return data["name"]+ " - "+data["population"];
    }
  });

  /* INIT MANAGER STATES */
  manager.initStates();
  console.log("states initialized");

/* -------------------------------------------------------------------------- */
/* --------------------------------- EVENTS --------------------------------- */
/* -------------------------------------------------------------------------- */
  // onclick for state layer
  map.getLayer('states').on('click', function(data, state, event) {
    manager.toggle(data,state);
  });

  // any checkbox
  $('#checkboxes :checkbox').change(function() {
    attrs = [];
    $('#checkboxes :checkbox:checked').each(function(index){
      attrs.push($(this).attr('name'));
    });
    manager.checkbox_toggle(attrs);

  });


}); /* loadMap() */
console.log("map loaded");
