var audioCtx;
var limiter;
var delay;
var tune;
var output;

var whiteNotes = [-12,-10,-8,-7,-5,-3,-1,0,2,4,5,7,9,11,12];

//-------------------------------------------------------------------------------------------
//  SETUP
//-------------------------------------------------------------------------------------------

function setupAudio() {

    // SCALE //
    tune = new Tune();
    tune.loadScale('ptolemy');
    tune.tonicize(440);

    // MASTER VOL //
    Tone.Master.volume.value = -3;
    audioCtx = Tone.context;

    limiter = new Tone.Limiter(-1);
    limiter.toMaster();

    delay = new Tone.PingPongDelay(0.15);
    delay.connect(limiter);
    output = delay;
}


//-------------------------------------------------------------------------------------------
//  AUDIO EVENT
//-------------------------------------------------------------------------------------------

// this gets called whenever an organism breeds or dies //
function soundEvent(volume, attack, release) {
    
        // configure the time and pitch //
        var now = audioCtx.currentTime;
        var duration = attack + release;
        var note = tune.note(tombola.item(whiteNotes));
    
        // create the oscillator and gain nodes //
        var osc = new Tone.Oscillator(note);
        var amp = audioCtx.createGain();
    
        // connect the oscillator and gain to the output //
        osc.connect(amp);
        amp.connect(output);
    
        // setup the volume envelope //
        amp.gain.setValueAtTime(0, now);
        amp.gain.linearRampToValueAtTime(volume, now + attack);
        amp.gain.exponentialRampToValueAtTime(0.00001, now + duration);
    
        // start the sound and schedule it stopping //
        osc.start();
        osc.stop('+' + (duration * 1.1));
    }
