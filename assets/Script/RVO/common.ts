export class Vector2 {
    public x: number = 0;
    public y: number = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    public plus(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    
    public minus(vector) {
    	return new Vector2(this.x - vector.x, this.y - vector.y);
    };
    
    public multiply(vector) {
    	return this.x * vector.x + this.y * vector.y;
    };
    
    public scale(k) {
        return new Vector2(this.x * k, this.y * k);
    };
}

export class KeyValuePair {
    public key = null;
    public value = null;

    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}

export class Line {
    point: Vector2;
    direction: Vector2;
}

export class Obstacle {
	point: Vector2;
	unitDir: Vector2;
	isConvex: Boolean;
	id: Number;
	prevObstacle: Obstacle;
	nextObstacle: Obstacle;
}

export class RVOMath {
    public static RVO_EPSILON: number = 0.01;

    public static absSq(v: Vector2) {
        return v.multiply(v);
    }

    public static normalize(v: Vector2) {
        return v.scale(1 / RVOMath.abs(v)); // v / abs(v)
    }

    public static distSqPointLineSegment(a: Vector2, b: Vector2, c: Vector2) {
        var aux1 = c.minus(a);
        var aux2 = b.minus(a);
        
        // r = ((c - a) * (b - a)) / absSq(b - a);
        var r = aux1.multiply(aux2) / RVOMath.absSq(aux2);
        
        if (r < 0) {
            return RVOMath.absSq(aux1); // absSq(c - a)
        } else if (r > 1) {
            return RVOMath.absSq(aux2); // absSq(c - b)
        } else {
            return RVOMath.absSq( c.minus(a.plus(aux2.scale(r))) ); // absSq(c - (a + r * (b - a)));
        }
    }

    public static sqr(p) {
        return p * p;
    };

    public static det(v1: Vector2, v2: Vector2) {
        return v1.x * v2.y - v1.y* v2.x;
    }

    public static abs(v: Vector2) {
        return Math.sqrt(RVOMath.absSq(v));
    }

    public static leftOf(a: Vector2, b: Vector2, c: Vector2) {
        return RVOMath.det(a.minus(c), b.minus(a));
    }
}