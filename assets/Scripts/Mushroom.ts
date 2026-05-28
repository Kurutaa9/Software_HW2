const {ccclass, property} = cc._decorator;

@ccclass
export default class Mushroom extends cc.Component {
    @property
    moveSpeed: number = 50;

    private rb: cc.RigidBody = null;
    private moveDir: number = 1;

    onLoad() {
        this.rb = this.getComponent(cc.RigidBody);
        this.rb.enabledContactListener = true; // CRITICAL: Ensure collisions trigger code!
        
        // Zero friction so it slides nicely
        let collider = this.getComponent(cc.PhysicsCollider);
        if (collider) {
            collider.friction = 0;
            collider.apply();
        }

        // Give it a tiny pop-out velocity if spawned inside a block
        this.rb.linearVelocity = cc.v2(0, 25); // Make pop stronger
    }

    update(dt) {
        this.rb.linearVelocity = cc.v2(this.moveDir * this.moveSpeed, this.rb.linearVelocity.y);
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        // Collides with Player
        if (otherCollider.node.name === 'Player') {
            contact.disabled = true; 

            let playerScript = otherCollider.node.getComponent('Player');
            if (playerScript) playerScript.growBig();
            
            // Safer destruction inside physics loop, using Cocos' official scheduleOnce to happen instantly after the frame
            this.scheduleOnce(() => {
                if (cc.isValid(this.node)) {
                    this.node.destroy();
                }
            }, 0);
            return;
        }

        // Bounces contextually on X-axis walls and pipes
        let normal = contact.getWorldManifold().normal;
        if (Math.abs(normal.x) > 0.5) {
            this.moveDir *= -1;
        }
    }
}
