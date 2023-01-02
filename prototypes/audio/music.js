export class Channel{
    constructor(context_, type="sine", startGainDelay_=0.5, endGainDelay_=2){
        this.context = context_;
        this.osciNode = this.context.createOscillator();
        this.osciNode.type = type;
        this.gainNode = this.context.createGain();
        this.osciNode.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);

        this.startGainDelay = startGainDelay_;
        this.endGainDelay = endGainDelay_;
        console.log(context_)
        this.osciNode.start(0);
        this.gainNode.gain.value = 0.00001;
        this.isPlaying = false;
    }

    play(){
        if (this.context.state == "suspended"){
            this.context.resume();    
        }
        
        this.gainNode.gain.exponentialRampToValueAtTime(1, this.context.currentTime +this.startGainDelay);
    
        
        setTimeout(() => {
            
            this.isPlaying = true;
        }, this.startGainDelay);
    }

    stop(){
        if (this.isPlaying){
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.context.currentTime);
            this.isPlaying = false;
            console.log(this.context.currentTime)
            this.gainNode.gain.exponentialRampToValueAtTime(0.00001, this.context.currentTime + this.endGainDelay);
            setTimeout(() => {
                this.isPlaying = false
            }, this.endGainDelay);
    
        }
    }
}


export class MusicPlayer{
    constructor(){
        this.context = new AudioContext();
        this.channels = [];
    }

    addChannel(type="sine"){
        let c = new Channel(this.context, type);
        this.channels.push(c);
    }

    setChannelStartGain(){
        
    }

    playChannel(){ // Would be good if this was multithreaded... but i dont think the precision is needed
        this.channels[0].play();
    }

    stopChannel(){ // Would be good if this was multithreaded... but i dont think the precision is needed
        this.channels[0].stop();
    }

    
}