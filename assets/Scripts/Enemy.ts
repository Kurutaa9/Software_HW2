const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
    @property
    moveSpeed: number = 100;

    private rb: cc.RigidBody = null;
    private anim: cc.Animation = null;
    private moveDir: number = -1;
    private isDead: boolean = false;
    private lastTurnTime: number = 0;
    private walkTimer: number = 0; // Timer to flip the sprite back and forth

    onLoad() {
        this.rb = this.getComponent(cc.RigidBody);
        this.rb.enabledContactListener = true; // Ensure collision detection is active!
        
        let collider = this.getComponent(cc.PhysicsCollider);
        if (collider) {
            collider.friction = 0; // Fixes getting stuck on walls/pipes
            collider.apply();
        }

        this.anim = this.getComponent(cc.Animation);
    }

    update(dt) {
        if (this.isDead) return;
        this.rb.linearVelocity = cc.v2(this.moveDir * this.moveSpeed, this.rb.linearVelocity.y);

        // Fake animation: flip the sprite X scale every 0.15 seconds to look like walking
        this.walkTimer += dt;
        if (this.walkTimer > 0.15) {
            this.walkTimer = 0;
            this.node.scaleX *= -1; // Rapidly flip it back and forth
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (this.isDead) return;
        let normal = contact.getWorldManifold().normal;
        
        // --- THE VIBRATION FIX ---
        // If the enemy hits a wall perfectly horizontally
        if (Math.abs(normal.x) > 0.5 && otherCollider.node.name !== 'Player') {
            // Use a 100ms cooldown so it can't mathematically trigger back and forth in the same frame!
            let now = Date.now();
            if (now - this.lastTurnTime > 100) {
                this.moveDir *= -1;
                // Removed the normal scaleX flip here so it doesn't clash with our custom walk animation
                this.lastTurnTime = now;
            }
        }

        // Checking if stomped by Player
        if (otherCollider.node.name === 'Player') {
            let myBox = selfCollider.node.getBoundingBoxToWorld();
            let otherBox = otherCollider.node.getBoundingBoxToWorld();
            
            let playerBottom = otherBox.yMin;
            let myTop = myBox.yMax;
            
            // If player's bottom is higher than our top, squish!
            if (playerBottom >= myTop - 5) { 
                this.die();
            }
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        
        this.rb.linearVelocity = cc.v2(0, 0);
        this.getComponent(cc.PhysicsBoxCollider).enabled = false;
        
        if (this.anim) {
            this.anim.play('die'); // Assuming a stomp animation on enemy exists
        } else {
            // Fallback squished effect
            this.node.scaleY = 0.2; 
        }

        // Destroy after 1 second
        this.node.runAction(cc.sequence(
            cc.delayTime(1),
            cc.removeSelf()
        ));
    }
    
}
