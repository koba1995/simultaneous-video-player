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
  this.skipintv=false;

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

 addvideo(video){
  this.video[this.vidcount]=video;
  video.id=this.vidcount;
  this.vidcount++;
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
   return (this.playtime/1000);
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
  this.setTimeMS( this.playtime + sec*1000 );
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
  this.video.filter(v => v.enabled).forEach(v => v.time(s) );
 }


 // with updating url
 // with updating HMS
 // Called inteanally by timer
 tickfn(){
  let now = new Date();
  this.playtime += now.getTime() - this.prevMS;
  this.prevMS = now.getTime();
  let hms = this.updateHMS();
  seturltime(hms, 0);
  this.seekvid();
  if(this.skipintv){
    if( !this.video.filter(v => (v.enabled && v.videosrc && v.video.currentTime<v.video.duration)).length ){
      // all video has finished
      //console.log('all video has finished');
      this.seeknext();
    }
  }
 }

 seeknext(){
   let next = this.video.filter(v => v.enabled).reduce((a,v)=>( v.panel.next.dtime<a ? v.panel.next.dtime : a ), 86400);
   if(next!=86400)
     this.moveTimeSec(next);
 }

 start(){
  if(this.interval) return;

  if( this.video.filter(v => (v.enabled && v.waiting)).length > 0 ){
    this.waiting=true;
    this.status();
    return;
  }
  let now = new Date();
  this.prevMS = now.getTime();
  this.video.filter(v => v.enabled).forEach(v => v.start() );
  this.interval=setInterval(()=>{this.tickfn();}, 500);
  console.log("Timer start.");
  this.status();
 }

 stop(){
  this.tickfn();
  this.video.forEach(v => v.stop());
  clearInterval(this.interval);
  this.interval=0;
  this.waiting=false;
  console.log("Timer stop.");
  this.status();
 }

 wait(){
   if(this.interval)
     this.waiting=true;

  let c=this.video.filter(v => v.waiting).length
  console.debug('waiting_count:', c);
  clearInterval(this.interval);
  this.interval=0;
  console.log("Timer stop.");
  this.status();
 }

 resume(){
  let c=this.video.filter(v => v.waiting).length
  console.debug('waiting_count:', c);
  if(c==0 && this.waiting){
   this.start();
   this.waiting=false;
  }
  this.status();
 }


 status(){
  this.statusbox.textContent=timer.interval?"Playing":timer.waiting?"Loading..":"Stopped";
 }

}
