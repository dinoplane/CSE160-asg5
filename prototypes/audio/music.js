export class MusicPlayer{
    constructor(){
        this.context = new AudioContext();
        this.channels = [];
    }

    addChannel(type="sine"){
        let c = this.context.createOscillator();
        c.type = type;
        
        c.connect(this.context.destination);
        c.start();
    }

    setChannelStartGain(){
        
    }
}