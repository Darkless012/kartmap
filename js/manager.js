//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/mmc [rev. #1]

mmc = function(o){
  for(var i, j, n, d, r = 1; (n = o.pop()) != undefined;)
    while(n > 1){
      if(n % 2){
        for (i = 3, j = Math.floor(Math.sqrt(n)); i <= j && n % i; i += 2);
        d = i <= j ? i : n;
      }
      else
        d = 2;
        for(n /= d, r *= d, i = o.length; i; !(o[--i] % d) && (o[i] /= d) == 1 && o.splice(i, 1));
      }
  return r;
};
/** -----
/   @param state
/     One possible state
/   @param bg_color
/     Assigned background color
/   @param boreder_color
/     Assigned border color
/----- */
function Member(state, bg_color, border_color, border_width) {
  this.object_state = state;
  this.bg_color = bg_color;
  this.border_color = border_color;
  this.border_width = border_width;
}
Member.prototype.getPath = function(){
  return this.object_state.path;
}
Member.prototype.getVPath = function(){
  return this.object_state.vpath;
}
Member.prototype.getSvgPath = function(){
  return this.object_state.svgPath;
}
Member.prototype.getData = function(){
  return this.object_state.data;
}
Member.prototype.getState = function(){
  return this.object_state.svgPath;
}
Member.prototype.redraw = function() {
  this.getState().attr("fill", this.bg_color);
  this.getState().attr("stroke", this.border_color);
  this.getState().attr("stroke-width", this.border_width);
}
Member.prototype.getAttr = function(attribute) {
  //if _.contains(this.this.getData(),attribute)
  return this.getData()[attribute];
}
Member.prototype.getIntAttr = function(attribute) {
  return parseInt(this.getAttr(attribute));
}

/** -----
/   @param states
/     This param takes all possible selectable states as an array.
/   @param colors
/     This param takes all possible colors for selection.
/     This also determines the number of selectable states.
/----- */
function Manager(K_map, layer_name) {
  this.map = K_map;
  this.layer_name = layer_name;
  this.color_pool = [];
  this.members = [];
  this.selected_members = [];
  this.selected_attributes = [];
}

Manager.prototype.initColors = function(color_pool,bg_color,border_color,
                                        selected_border_color, border_width,
                                        selected_border_width) {
  this.bg_color = bg_color;
  this.border_color = border_color;
  this.selected_border_color = selected_border_color;
  this.border_width = border_width;
  this.selected_border_width = selected_border_width;
  this.color_pool = color_pool;
}

Manager.prototype.initStates = function(){
  var paths = map.getLayer(this.layer_name).getPathsData();
  for (state_id in paths) {
    var R_state = map.getLayer(this.layer_name).getPaths({ "name": paths[state_id]["name"]})[0]
    var member = new Member(R_state,this.bg_color, this.border_color);
    this.members.push(member);
  }
}

Manager.prototype.getMember = function(R_state) {
  var retval = false;
  var ret_member = null;

  for(var i = 0; i < this.members.length; i++) {
    var member = this.members[i];
    if (member.getState().id == R_state.id) {
      retval = true;
      ret_member = member;
    }
  }
  if (retval) {
    return ret_member;
  }
  return false;
}

Manager.prototype.isSelected = function(member) {
  return (_.contains(this.selected_members,member));
}

Manager.prototype.select = function(member){
  if (this.color_pool.length < 1) {
    return;
  }
  member.bg_color = this.color_pool.pop();
  this.selected_members.push(member);

  member.border_color = this.selected_border_color;
  member.border_width = this.selected_border_width;
  member.redraw();
}

Manager.prototype.unselect = function(member){
  this.color_pool.push(member.bg_color);
  this.selected_members = _.without(this.selected_members, member);

  member.bg_color = this.bg_color;
  member.border_color = this.border_color;
  member.border_width = this.border_width;
  member.redraw();
}

Manager.prototype.toggle = function(data,R_state){
  var member = this.getMember(R_state);
  // member found
  if (member !== false) {
    if(this.isSelected(member)){
      //is selected - unselect
      this.unselect(member);
    } else {
      //is not selected - select
      this.select(member);
    }
    this.redraw();
  }
}
Manager.prototype.checkbox_toggle = function(attrs){
  this.selected_attributes = attrs;
  this.redraw();
}

Manager.prototype.getLCM = function(){
  if (this.selected_attributes.length == 0){
    return 0;
  }
  var arr = [];
  for(var i = 0; i < this.selected_attributes.length; i++) {
    arr.push(this.getNormal(this.selected_attributes[i]));
  }
  return mmc(arr);
}

Manager.prototype.getWeightedMemberAttr = function(member, attr){
  var value = member.getIntAttr(attr);
  var lcm = this.getLCM();
  var min = this.getMin(attr);
  var norm = this.getNormal(attr);
  return (value-min)*(lcm/norm);
}
Manager.prototype.getTotalWeightedMemberAttrs = function(member){
  var sum = 0;
  for (var i = 0; i < this.selected_attributes.length; i++) {
    var attr = this.selected_attributes[i];
    sum += this.getWeightedMemberAttr(member, attr);
  }
  return sum;
}

Manager.prototype.getClosestSelectedMember = function(member) {
  if ((this.selected_members.length == 0) || (this.selected_attributes.length == 0)) {
    return false;
  }
  var ret_member = null;
  var diff = null;

  //member
  var member_sum = this.getTotalWeightedMemberAttrs(member);

  for(var i = 0; i < this.selected_members.length; i++) {
    var selected_member = this.selected_members[i];
    var selected_member_sum = this.getTotalWeightedMemberAttrs(selected_member);

    var new_diff = Math.abs( member_sum - selected_member_sum );
    if (diff == null || new_diff < diff)  {
      diff = new_diff;
      ret_member = selected_member;
    }
  }
  return ret_member;
}

Manager.prototype.getPercentage = function(member, selected_member) {
  var middle = this.getTotalWeightedMemberAttrs(selected_member);
  var min = null;
  var max = null;
  var target_member = this.getTotalWeightedMemberAttrs(member);

  var closest_member_low = this.getClosestMemberLow(selected_member);
  var closest_member_high = this.getClosestMemberHigh(selected_member);


  if (closest_member_low == false) {
    min = this.getMinTotalWeighted();
  } else {
    min = this.getTotalWeightedMemberAttrs(closest_member_low);
  }
  if (closest_member_high == false) {
    max = this.getMaxTotalWeighted();
  } else {
    max = this.getTotalWeightedMemberAttrs(closest_member_high);
  }

  if (min > middle-(max-middle)) {
    total_min = middle-(max-middle);
  } else {
    total_min = min;
  }

  if (target_member < middle) {
    final_member = target_member;
  } else {
    final_member = middle-(target_member-middle);
  }

  var a = 1/(middle-total_min);
  var b = -1*a*total_min;
  y = a*final_member+b;
  console.log(y);
  return 1-y;
}

Manager.prototype.getClosestMemberHigh = function(member, attr) {
  var min = null;
  var ret_member = null;
  var member_attr = this.getTotalWeightedMemberAttrs(member);

  for (var i = 0; i < this.selected_members.length; i++) {
    var selected_member = this.selected_members[i];

    if (member.getState().id == selected_member.getState().id) {
      continue;
    }
    var selected_member_attr = this.getTotalWeightedMemberAttrs(selected_member);

    if ( (selected_member_attr > member_attr) && (min == null || selected_member_attr < min) ) {
      min = selected_member_attr;
      ret_member = selected_member;
    }
  }

  if (ret_member == null){
    return false;
  }
  return ret_member;
}

Manager.prototype.getClosestMemberLow = function(member, attr) {
  var max = null;
  var ret_member = null;
  var member_attr = this.getTotalWeightedMemberAttrs(member);

  for (var i = 0; i < this.selected_members.length; i++) {
    var selected_member = this.selected_members[i];

    if (member.getState().id == selected_member.getState().id) {
      continue;
    }
    var selected_member_attr = this.getTotalWeightedMemberAttrs(selected_member);

    if ( (selected_member_attr < member_attr) && (max == null || selected_member_attr > max) ) {
      max = selected_member_attr;
      ret_member = selected_member;
    }
  }

  if (ret_member == null){
    return false;
  }
  return ret_member;
}

Manager.prototype.getMaxMember = function(attr) {
  var max = null;
  var ret_member = null;

  for(var i = 0; i < this.members.length; i++) {
    var member = this.members[i];
    var member_attr = member.getIntAttr(attr);
    if (max == null || member_attr > max) {
      max = member_attr;
      ret_member = member;
    }
  }
  if (ret_member == null){
    return false;
  }
  return ret_member;
}

Manager.prototype.getMax = function(attr) {
  return this.getMaxMember(attr).getIntAttr(attr);
}

Manager.prototype.getMinMember = function(attr) {
  var min = null;
  var ret_member = null;

  for(var i = 0; i < this.members.length; i++) {
    var member = this.members[i];
    var member_attr = member.getIntAttr(attr);
    if (min == null || member_attr < min) {
      min = member_attr;
      ret_member = member;
    }
  }
  if (ret_member == null){
    return false;
  }
  return ret_member;
}
Manager.prototype.getMin = function(attr) {
  return this.getMinMember(attr).getIntAttr(attr);
}

Manager.prototype.getNormal = function(attr) {
  // TODO optimize
  return this.getMax(attr) - this.getMin(attr);
}

Manager.prototype.getMinTotalWeighted = function() {
  var min = null;
  for (var i = 0; i < this.members.length; i++) {
    var member = this.members[i];
    var member_value = this.getTotalWeightedMemberAttrs(member);
    if (min == null || member_value < min) {
      min = member_value;
    }
  }
  return min;
}

Manager.prototype.getMaxTotalWeighted = function() {
  var max = null;
  for (var i = 0; i < this.members.length; i++) {
    var member = this.members[i];
    var member_value = this.getTotalWeightedMemberAttrs(member);
    if (max == null || member_value > max) {
      max = member_value;
    }
  }
  return max;
}

Manager.prototype.redraw = function() {
  for (var i = 0; i < this.members.length; i++) {
    member = this.members[i];
    if(this.isSelected(member)){
      // don't touch selected
      continue;
    }
    closest_member = this.getClosestSelectedMember(member);

    if (closest_member == false){
      member.bg_color = this.bg_color;
      member.redraw();
    } else {
      percentage = this.getPercentage(member, closest_member);
      member.bg_color = chroma.interpolate(closest_member.bg_color, 'white', percentage);
      member.redraw();
    }
  }
}
