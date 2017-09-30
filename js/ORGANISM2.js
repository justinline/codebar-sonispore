var org2Settings = {
    speed: 3.0,
    minSpeed: 1.1,
    fluctuation: (TAU/360) * 9,
    rotationSpeed: 6,
    small: 12,
    large: 18,
    tail: 22,
    breedRange: 600,
    breedEnergy: 40,
    breedProximity: 20,
    feedRange: 100,
    feedCap: 60,
    feedProximity: 25,
    color: 'coral',
    soundAttack: 0.1,
    soundRelease: 3,
    soundVolume: 0.2
};

//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------

function Organism2(x1, y1, x2, y2) {
    this.settings = org2Settings;
    // Randomise Position
    this.position = new Point(tombola.range(x1,x2), tombola.range(y1,y2));
    this.lastPositions = [];

    // Randomise Angles
    this.angle = tombola.rangeFloat(0, TAU);
    this.angleDest = this.angle;

    // Randomise other properties
    this.size = tombola.rangeFloat(this.settings.small, this.settings.large);
    this.speed = tombola.rangeFloat(this.settings.minSpeed, this.settings.speed);
    this.energy = tombola.rangeFloat(7,8);
}


//-------------------------------------------------------------------------------------------
//  UPDATE
//-------------------------------------------------------------------------------------------

Organism2.prototype.update = function() {
    // BREEDING //
    if (this.energy > this.settings.breedEnergy) {
        var partner = null;
        var range = this.settings.breedRange;

        // check for potential partners //
        for (j=0; j<org2.length; j++) {
            var organism = org2[j];
            if (organism!== this && organism.energy > this.settings.breedEnergy && distanceBetweenPoints(this.position, organism.position) < range ) {
                partner = organism;
                range = distanceBetweenPoints(this.position, organism.position);
            }
        }
        if (partner) {
            // point towards partner //
            this.angleDest = angleBetweenPoints(this.position, partner.position);
            if (this.speed < partner.speed) {
                this.speed -= this.settings.fluctuation;
            } else {
                this.speed += this.settings.fluctuation;
            }

            // if close enough to partner, breed! //
            if (distanceBetweenPoints(this.position, partner.position) < this.settings.breedProximity) {
                var area = 10 * scale;
                generateOrganism2(1, this.position.x - area, this.position.y - area, this.position.x + area, this.position.y + area);
                generateVisual(this.position, this.size);
                soundEvent(this.settings.soundVolume, this.settings.soundAttack, this.settings.soundRelease);
                this.energy -= 30;
                partner.energy -= 30;
            }
        }
    }
    
    // FEEDING //
    if (!partner && this.energy < this.settings.feedCap) {
        var target = null;
        var range = this.settings.feedRange;
        for (j=0; j<org1.length; j++) {
            var organism = org1[j];
            if (distanceBetweenPoints(this.position, organism.position) < range ) {
                target = organism;
                range = distanceBetweenPoints(this.position, organism.position);
            }
        }
        if (target) {

            // point towards target //
            this.angleDest = angleBetweenPoints(this.position, target.position);

            // if close enough to target, eat it! //
            if (distanceBetweenPoints(this.position, target.position) < this.settings.feedProximity) {
                this.energy += (target.size * 1.5);
                target.kill();
            }
        }
    }


    // ENERGY //
    this.energy -= 0.01;
    if (this.energy <= 0) {
        this.kill();
    }
    // MOVEMENT //
    // Store a memory of previous positions clone makes a copy of the object //
    this.lastPositions.push( this.position.clone() );
    if (this.lastPositions.length > this.settings.tail) {
        this.lastPositions.shift();
    }

    // Randomly increase or decrease rotation & speed //
    this.angle = normaliseAngle(this.angle);
    this.angleDest += tombola.rangeFloat(-this.settings.fluctuation, this.settings.fluctuation);
    if ((this.angleDest - this.angle) > (TAU/2)) {
        this.angleDest -= TAU;
    }
    if ((this.angleDest - this.angle) < -(TAU/2)) {
        this.angleDest += TAU;
    }

    // smoothly transition to angle //
    this.angle = lerp(this.angle, this.angleDest, this.settings.rotationSpeed);
    this.speed += tombola.rangeFloat(-this.settings.fluctuation, this.settings.fluctuation);

    // Cap the max speed so it doesn't get out of control //
    this.speedCap();

    // Update the position by adding the seed to it //
    this.position.x += (this.speed * Math.cos(this.angle));
    this.position.y += (this.speed * Math.sin(this.angle));

    // Wrap around the screen boundaries //
    screenWrap(this);
};


//-------------------------------------------------------------------------------------------
//  DRAW
//-------------------------------------------------------------------------------------------

Organism2.prototype.draw = function() {
    ctx.fillStyle = this.settings.color;
    ctx.strokeStyle = this.settings.color;

    // set Scale
    ctx.lineWidth = 4 * scale;
    var s = this.size;


    // head
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.moveTo(s * 0.75, s/2);
    ctx.lineTo(0, s * 1.25);
    ctx.moveTo(s * 0.75, -s/2);
    ctx.lineTo(0, -s * 1.25);
    ctx.moveTo(s * 1.75, s/2);
    ctx.lineTo(0, s * 2.25);
    ctx.moveTo(s * 1.75, -s/2);
    ctx.lineTo(0, -s * 2.25);

    ctx.moveTo(0, s/2);
    ctx.lineTo(s/2, 0);
    ctx.lineTo(0, -s/2);
    ctx.lineTo(-s/2, 0);    
    ctx.lineTo(0, s/2);

    ctx.stroke();
    ctx.restore();
};


//-------------------------------------------------------------------------------------------
//  KILL
//-------------------------------------------------------------------------------------------

Organism2.prototype.kill = function() {
    removeFromArray(this, org2);
    var area = 30 * scale;
    generateSpores(this.size * 0.42, this.position.x - area, this.position.y - area, this.position.x + area, this.position.y + area);
    generateVisual(this.position, this.size, 'red');
    soundEvent(this.settings.soundVolume, this.settings.soundAttack, this.settings.soundRelease);
};


//-------------------------------------------------------------------------------------------
//  SPEED CAP
//-------------------------------------------------------------------------------------------

Organism2.prototype.speedCap = function() {
    this.speed = Math.min(this.speed,this.settings.speed);
    this.speed = Math.max(this.speed,this.settings.minSpeed);
};


//-------------------------------------------------------------------------------------------
//  WRAP
//-------------------------------------------------------------------------------------------

Organism2.prototype.wrap = function() {
    this.lastPositions = [];
};
