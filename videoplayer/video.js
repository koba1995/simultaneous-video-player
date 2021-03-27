enable_preload=1;

//----video files----

class timervideo{
 constructor(timer,path,videoelement,panelelement,checkelement){
  this.height=240; //[px]
  this.timer = timer;
  timer.addvideo(this);
  this.path=path;
  this.video=videoelement;
  //  this.playing        : The video element is in (currentTime < duration) condition and playing.
  //  this.timer.interval : Timer is playing.
  this.playing=false;

  // Panel //
  this.panel={};
  this.panel.next=document.createElement('button');
  this.panel.prev=document.createElement('button');
  this.panel.last=document.createElement('button');
  //this.panel.prev.appendChild(document.createTextNode('<-Prev motion'));
  //this.panel.last.appendChild(document.createTextNode('<-This motion beginning'));
  //this.panel.next.appendChild(document.createTextNode('Next motion->'));
  this.panel.prev.className='p';
  this.panel.last.className='p';
  this.panel.next.className='n';
  this.panel.prev['data-dtime']=0;
  this.panel.prev['data-dtime']=0;
  this.panel.next['data-dtime']=0;
  this.panel.prev.onclick=(e)=>{this.timer.moveTimeSec(e.target['data-dtime']);};
  this.panel.last.onclick=(e)=>{this.timer.moveTimeSec(e.target['data-dtime']);};
  this.panel.next.onclick=(e)=>{this.timer.moveTimeSec(e.target['data-dtime']);};
  panelelement.appendChild(this.panel.prev);
  panelelement.appendChild(this.panel.last);
  panelelement.appendChild(this.panel.next);

  // checkbox //
  checkelement.onchange = ()=>{this.enable(checkelement.checked); };
  this.enable(checkelement.checked);

  // video setting //
  this.video.style.height=this.height+'px';
  this.video.onloadedmetadata = ()=>{
    console.debug("loadedmetadata ", this.videosrc, '  duration=', this.video.duration);
    this.time(this.timer.getTimeSec());
    if(this.videosrc && !this.video.style.width)
      this.video.style.width = this.height*this.video.videoWidth/this.video.videoHeight+'px';
  };
  this.video.onloadeddata = ()=>{
    console.debug("loadeddata ", this.videosrc);
    //this.timer.resume(this);
  };
  this.video.onwaiting = ()=>{
    console.debug('waiting', this.videosrc);
    this.waiting=true;
    this.timer.wait(this);
  };
  this.video.oncanplay = ()=>{
    console.debug('canplay', this.videosrc);
    if(this.waiting) this.video.pause();
    this.waiting=false;
    this.timer.resume(this);
  };
  this.video.oncanplaythrough = ()=>{
    console.debug('canplaythrough',this.videosrc );
    //if(!this.timer.waiting && this.timer.interval )
    if(enable_preload) this.preload(this.file_next_name);
  };

  // preload video element //
  this.preload_video = document.createElement('video');
  this.preload_video.onloadedmetadata = ()=>{
    console.debug("preload_loadedmetadata ", this.preload_videosrc, '  duration=', this.preload_video.duration);
  };
  this.preload_video.onloadeddata = ()=>{
    console.debug('preload_loadeddata ', this.preload_videosrc);
  };

  // load file list //
  this.updatefile();
 }

 enable(value){
  this.enabled=value;
  this.video.style.display=(value?'':'none');
  this.panel.prev.style.display=(value?'':'none');
  this.panel.next.style.display=(value?'':'none');
  this.panel.last.style.display=(value?'':'none');
  if(value) this.time(this.timer.getTimeSec());
 };

 updatefile(){
  let xhr = new XMLHttpRequest();
  xhr.open("GET",this.path);
  xhr.setRequestHeader("Accept","application/json");
  xhr.send();
  let obj = this;
  xhr.onreadystatechange=function(){
   if(this.readyState == 4){
    if(this.status != 200) return;
    if(this.getResponseHeader('Content-Type') != "application/json") return;
    obj.files = JSON.parse(this.responseText);
    for(let i in obj.files){
     let s = obj.files[i].name.split('_');
     s = s[2].split('-');
     obj.files[i].time = (parseInt(s[0])*60+parseInt(s[1]))*60+parseInt(s[2]);
    }
    console.debug("updatefile ", obj.path, obj.files);
    if(obj.enabled){
     obj.time(obj.timer.getTimeSec());
    }
   }
  };
 }

 fileoftime(time){
  let prevfile={}, lastfile={};
  for(let i in this.files){
   let nextfile = this.files[i];
   if(nextfile.time > time){
     return {
      name: lastfile.name, cursor: (time - lastfile.time), 
      next_cursor: time - nextfile.time, 
      next_name : nextfile.name,
      prev_cursor: time - prevfile.time, 
     };
   }
   prevfile = lastfile;
   lastfile = nextfile;
  }
     // there is no next file
     //console.log('there is no next file');
     //this.updatefile();
     return {
      name: lastfile.name, cursor: (time - lastfile.time), 
      prev_cursor: time - prevfile.time, 
     };
 }

 time(timestr){
  let file=this.fileoftime(timestr);
  //console.debug("fileoftime() res: ",file);

  // update panel button //
  this.file_next_name = file.next_name;
  this.panel.prev.disabled = file.prev_cursor?0:1;
  this.panel.last.disabled = file.cursor?0:1;
  this.panel.next.disabled = file.next_cursor?0:1;
  this.panel.prev['data-dtime'] = -file.prev_cursor;
  this.panel.last['data-dtime'] = -file.cursor;
  this.panel.next['data-dtime'] = -file.next_cursor;
  this.panel.prev.innerText=file.prev_cursor;
  this.panel.last.innerText=file.cursor;
  this.panel.next.innerText=-file.next_cursor;

  // update border //
  this.video.style.border = (file.name && (file.cursor==0 || file.cursor<this.video.duration))?"solid red":"solid white";

  // update video //
  if(file.name){
   if(this.videosrc!=file.name){
    this.videosrc=file.name;
    let filepath=this.path + file.name
    console.debug('video set ', filepath);
    this.video.setAttribute("src",filepath);
    // wait for loading meta data //
      this.waiting=true;
      this.timer.wait(this);
    return;
    // wait for metadata load /
   }

   // if metadata is not loaded //
   if(!this.video.duration){ this.waiting=true; this.timer.wait(); return; }

   let d=this.video.currentTime - file.cursor;
   if(file.cursor < this.video.duration){
     if((d<-1 || d>1) )
       this.video.currentTime = file.cursor;
     //  this.playing        : The video element is in (currentTime < duration) condition and playing.
     //  this.timer.interval : Timer is playing.
     if(this.timer.interval )
       this.start();
   }else{
     if(this.video.currentTime != this.video.duration)
      this.video.currentTime = this.video.duration ;
     this.playing = false;
   }
  }else{
   // no file of this time
   if(this.videosrc){
    this.video.setAttribute("src","dummy.mp4");
    this.videosrc="";
   }
  }
  //
 }

 preload(next_name){
  // [preload] 
  if(next_name && this.preload_videosrc != next_name){
    this.preload_videosrc = next_name;
    this.preload_video.setAttribute('src', this.path + next_name);
  }
  // [preload] 
 }

 start(){
  if(this.videosrc && !this.video.ended ){
    this.video.play();
    this.playing=true;
   }
 }
 stop(){
   this.playing=false;
   // To avoid "DOMException: The fetching process for the media resource was aborted by the user agent at the user's request.".
   // this.video.pause() will be called in this.video.oncalplay.
   if(!this.waiting) 
   this.video.pause();
 }
}
