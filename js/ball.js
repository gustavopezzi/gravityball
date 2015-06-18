var RADIUS = 20;
var SPEED = 2;

var input = (function() {
    var keyCode = {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39
    };

    var keyState = (function () {
        var state = {};
        Object.keys(keyCode).forEach(function(key, value) {
            state[keyCode[key]] = false;
        });

        return state;
    })();

    function getAsyncKeyState(state) {
        return keyState[state];
    }

    document.addEventListener('keydown', function(e) {
        if (keyState[e.keyCode] != undefined) {
            keyState[e.keyCode] = true;
        }
    });

    document.addEventListener('keyup', function(e) {
        if (keyState[e.keyCode] != undefined) {
            keyState[e.keyCode] = false;
        }
    });

    return {
        getAsyncKeyState: getAsyncKeyState,
        keyCode: keyCode
    };
})();

var force = function(angle, magnitude) {
    this.angle = angle;
    this.magnitude = magnitude;
};

var rPoint = function(x, y, velocity, forces) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.forces = forces;
};

function getPointNextPos(point) {
    var result = new rPoint(point.x, point.y, point.velocity, point.forces);
    var actingForces = addForceArr(point.forces);
    result.velocity = addForces(point.velocity, actingForces);

    result.x += Math.cos(point.velocity.angle) * point.velocity.magnitude;
    result.y -= Math.sin(point.velocity.angle) * point.velocity.magnitude;
    return result;
}

function forceToPoint(myforce) {
    return new rPoint(Math.cos(myforce.angle) * myforce.magnitude, Math.sin(myforce.angle) * myforce.magnitude);
}

function pointToForce(mypoint) {
    return new force(direction(new rPoint(0, 0), mypoint), distance(new rPoint(0, 0), mypoint));
}

function flipY(myforce) {
    var point = forceToPoint(myforce);
    point.x = -point.x;
    return new force(direction(new rPoint(0, 0), point), myforce.magnitude);
}

function flipX(myforce) {
    var point = forceToPoint(myforce);
    point.y = -point.y;
    return new force(direction(new rPoint(0, 0), point), myforce.magnitude);
}

function distance(a, b) {
    return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
}

function direction(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
}

function addForces(a, b) {
    var aPoint = forceToPoint(a);
    var bPoint = forceToPoint(b);
    return new pointToForce(new rPoint(aPoint.x + bPoint.x, aPoint.y + bPoint.y));
}

function addForceArr(forces) {
    var result = new force(0, 0);
    
    for (var i = 0; i < forces.length; i++)
        result = addForces(result, forces[i]);
    
    return result;
}

function collision(points) {
    for (var i = 0; i < points.length; i++) {
        var newPoint = getPointNextPos(points[i]);
        
        if (newPoint.y > canvas.height - RADIUS)
            points[i].velocity = flipX(points[i].velocity);
        
        if (newPoint.y < RADIUS)
            points[i].velocity = flipX(points[i].velocity);
        
        if (newPoint.x < RADIUS)
            points[i].velocity = flipY(points[i].velocity);
        
        if (newPoint.x > canvas.width - RADIUS)
            points[i].velocity = flipY(points[i].velocity);
        
        if (newPoint.y > canvas.height - RADIUS || newPoint.y < RADIUS || newPoint.x < RADIUS || newPoint.x > canvas.width - RADIUS) {
            points[i].velocity.magnitude = (points[i].velocity.magnitude / 2);
            
            if (points[i].velocity.magnitude < 1.1)
                points[i].velocity.magnitude = 0;
        }
    }
}

window.onload = function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function render(points) {
        ctx.fillStyle = "#212121";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.arc(points[i].x, points[i].y, RADIUS, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.closePath();
        }
    }

    function update(points) {
        collision(points);

        for (var i = 0; i < points.length; i++)
            points[i] = getPointNextPos(points[i]);
    }

    var forces = [new force(-Math.PI / 2, 1)]; // gravity force
    var myPoint = new rPoint(50, 50, new force(0, 15), forces);
    var points = [myPoint];

    function controls() {
        if (input.getAsyncKeyState(input.keyCode.UP))
            points[0].velocity = addForces(points[0].velocity, new force(Math.PI / 2, SPEED));
        
        if (input.getAsyncKeyState(input.keyCode.LEFT))
            points[0].velocity = addForces(points[0].velocity, new force(Math.PI, SPEED));
        
        if (input.getAsyncKeyState(input.keyCode.RIGHT))
            points[0].velocity = addForces(points[0].velocity, new force(0, SPEED));
        
        if (input.getAsyncKeyState(input.keyCode.DOWN))
            points[0].velocity = addForces(points[0].velocity, new force(-Math.PI / 2, SPEED));
    }

    function animate() {
        controls();
        update(points);
        render(points);
        window.requestAnimationFrame(animate);
    }

    animate();
};