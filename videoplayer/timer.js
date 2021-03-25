//----timing----

class timerclass{
 constructor(hou,min,sec,stausbox){
  this.statusbox=statusbox;
  this.hou=hou;
  this.min=min;
  this.sec=sec;
  this.video=[];
  this.vidcount=0;
  this.waiting=false;

  // HMS
  this.hou.onchange =
  this.min.onchange =
  this.sec.onchange =
   ()=>{
    let h=this.hou.value,
        m=this.min.value,
        s=this.sec.value;
    this.setTimeFromInputHMS(h,m,s);
   };
  //
 }

 // updating input HMS
 updateHMS(){
  let t = new Date( this.playtime ),
  h=t.getUTCHours().toString(),
  m=t.getUTCMinutes().toString(),
  s=t.getUTCSeconds().toString();
  if(h.length==1)h="0"+h;
  if(m.length==1)m="0"+m;
  if(s.length==1)s="0"+s;
  hou.value=h;
  min.value=m;
  sec.value=s;
  return {h:h,m:m,s:s};
 }

 getTimeSec(){
   return parseInt(this.playtime/1000);
 }

 chkmsec(msec){
  const max=24*60*60*1000-1;
  return msec>max?max:(msec>0?msec:0);
 }

 // [msec] since 00:00:00
 // with updating url
 // with updating HMS
 setTimeMS(msec){
  msec=this.chkmsec(msec);
  console.log('setTime:', msec);
  this.playtime = msec ;
  let hms = this.updateHMS();
  seturltime(hms, 0);
  this.seekvid();
 }

 // with updating url
 // with updating HMS
 moveTimeSec(sec){
  //console.log('moveTime:', sec);
  //this.setTimeMS( this.playtime + sec*1000 );
  this.setTimeMS( (this.getTimeSec() + sec)*1000 );
 }

 // h:m:s
 // with no updating url
 // with updating HMS
 setTimeFromUrl(h,m,s){
  let msec = ((parseInt(h)*60+parseInt(m))*60+parseInt(s))*1000 ;
  msec = this.chkmsec(msec);
  this.playtime = msec ;
  console.log('setTimeHMS:', msec);
  this.updateHMS();
  //////seturltime( hms, 0);
  this.seekvid();
 }

 // with updating url
 // with updating HMS
 setTimeFromInputHMS(h,m,s){
  //let hms = this.setTimeFromUrl(h,m,s);
  //seturltime(hms, 0);
  //
  let msec = ((parseInt(h)*60+parseInt(m))*60+parseInt(s))*1000 ;
  msec=this.chkmsec(msec);
  this.playtime = msec ;
  console.log('setTimeHMS:', msec);
  let hms=this.updateHMS(); //
  seturltime(hms, 0);
  this.seekvid();
 }


 // with no updating url
 // with no updating HMS
 seekvid(){
  let s = this.getTimeSec();
  for(let i=0; i<this.vidcount;i++)
  if(this.video[i].enabled){
   this.video[i].time(s);
  }
 }


 // with updating url
 // with updating HMS
 tickfn(){
  let now = new Date();
  this.playtime += now.getTime() - this.prevMS;
  this.prevMS = now.getTime();
  let hms = this.updateHMS();
  seturltime(hms, 0);
  this.seekvid();
 }

 status(){
  this.statusbox.textContent=timer.interval?"Playing":timer.waiting?"Loading..":"Stopped";
 }

 start(){
  if(this.interval) return;
  for(let i=0; i<this.vidcount;i++){
   if(this.video[i].enabled && this.video[i].waiting){
    this.waiting=true;
    this.status();
    return;
   }
  }
  let now = new Date();
  this.prevMS = now.getTime();
  for(let i=0; i<this.vidcount;i++){
   if(this.video[i].enabled)
    this.video[i].start();
  }
  this.interval=setInterval(()=>{this.tickfn();}, 500);
  console.log("Timer start.");
  this.status();
 }

 stop(){
  for(let i=0; i<this.vidcount;i++) this.video[i].stop();
  clearInterval(this.interval);
  this.interval=0;
  this.waiting=false;
  console.log("Timer stop.");
  this.status();
 }

 wait(){
   if(this.interval)
     this.waiting=true;

  let c=0;
  for(let i=0; i<this.vidcount;i++){
   this.video[i].stop();
   if(this.video[i].enabled && this.video[i].waiting){
    c++;
    //return;
   }
  }
  console.debug('waiting_count:', c);
  clearInterval(this.interval);
  this.interval=0;
  console.log("Timer stop.");
  this.status();
 }

 resume(){
  let c=0;
  for(let i=0; i<this.vidcount;i++){
   if(this.video[i].enabled && this.video[i].waiting){
    c++;
    //return;
   }
  }
  console.debug('waiting_count:', c);
  if(c==0 && this.waiting){
   this.start();
   this.waiting=false;
  }
  this.status();
 }

 addvideo(video){
  this.video[this.vidcount]=video;
  video.id=this.vidcount;
  this.vidcount++;
 }


}
