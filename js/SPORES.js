
var sporeSettings = {
    speed: 1.6,
    fluctuation: 0.2,
    small: 1,
    large: 4,
    variation: 34,
    color: 'snow',
    highlight: 'coral',
    soundAttack: 0.02,
    soundRelease: 0.12,
    soundVolume: 0.5
};

//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------

function Spore(x1,y1,x2,y2) {
    this.settings = sporeSettings;

    // Start spore at random position using tombola library
    this.position = new Point(tombola.range(x1,x2), tombola.range(y1,y2));

    // Randomise other properties
    this.size = tombola.rangeFloat(this.settings.small, this.settings.large);
    this.variant = tombola.percent(this.settings.variation);
    this.speedX = tombola.rangeFloat(-this.settings.speed, this.settings.speed);
    this.speedY = tombola.rangeFloat(-this.settings.speed, this.settings.speed);
    
}


//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------

Spore.prototype.update = function() {
    // Randomly increase or decrease h & v speeds
    this.speedX += tombola.rangeFloat(-this.settings.fluctuation, this.settings.fluctuation);
    this.speedY += tombola.rangeFloat(-this.settings.fluctuation, this.settings.fluctuation);

    // Cap Speed
    this.speedCap();

    // Update the position by adding the speed to it
    this.position.x += this.speedX;
    this.position.y += this.speedY;
    if(tombola.range(0,10000) <= 1 && org1.length < 2){
        var area = 10 * scale;
        generateOrganism1(1, this.position.x - area, this.position.y - area, this.position.x + area, this.position.y + area);
        generateVisual(this.position, this.size);
        soundEvent(this.settings.soundVolume, this.settings.soundAttack, this.settings.soundRelease);
        this.kill();
    }
    if(!this.variant){
        if(tombola.range(0,10000) <= 1){
            if(tombola.range(0,1) == 1){
                this.kill();
            } else {
                var area = 10 * scale;
                this.variant = true;
            }
        }
    }
    

    // Wrap around Screen Boundary main.js function
    screenWrap(this);
    
}


//-------------------------------------------------------------------------------------------
//  DRAW
//-------------------------------------------------------------------------------------------

Spore.prototype.draw = function() {
    // Set Color
    ctx.fillStyle = this.settings.color;
    ctx.strokeStyle = this.settings.highlight;

    // Set Size
    ctx.lineWidth = 4 * scale;
    var s = this.size;

    // Move to spore position
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Draw
    if (this.variant) {
        s*=2;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, 0);
        ctx.lineTo(0,s);
        ctx.lineTo(-s,0);
        ctx.closePath();
        ctx.stroke();
    } 
    else {
        ctx.fillRect(-s / 2, -s / 2, s, s)
    }    


    // Reset drawing position
    ctx.restore();
};


//-------------------------------------------------------------------------------------------
//  KILL
//-------------------------------------------------------------------------------------------

Spore.prototype.kill = function() {
    removeFromArray(this, spores);
    generateVisual(this.position, this.size);
    soundEvent(this.settings.soundVolume, this.settings.soundAttack, this.settings.soundRelease);
};


//-------------------------------------------------------------------------------------------
//  SPEED CAP
//-------------------------------------------------------------------------------------------

Spore.prototype.speedCap = function() {
    this.speedX = Math.min(this.speedX,this.settings.speed);
    this.speedX = Math.max(this.speedX,-this.settings.speed);
    this.speedY = Math.min(this.speedY,this.settings.speed);
    this.speedY = Math.max(this.speedY,-this.settings.speed);
};


//-------------------------------------------------------------------------------------------
//  WRAP
//-------------------------------------------------------------------------------------------

Spore.prototype.wrap = function() {

};
