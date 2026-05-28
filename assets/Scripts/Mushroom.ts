const {ccclass, property} = cc._decorator;

@ccclass
export default class Mushroom extends cc.Component {
    @property
    moveSpeed: number = 150;

    private rb: cc.RigidBody = null;
    private moveDir: number = 1;

    onLoad() {
        this.rb = this.getComponent(cc.RigidBody);
        
        // Give it a tiny pop-out velocity if spawned inside a block
        this.rb.linearVelocity = cc.v2(0, 25);
    }

    update(dt) {
        this.rb.linearVelocity = cc.v2(this.moveDir * this.moveSpeed, this.rb.linearVelocity.y);
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        let normal = contact.getWorldManifold().normal;
        
        // Bounces contextually on X-axis walls and pipes
        if (Math.abs(normal.x) > 0.5 && otherCollider.node.name !== 'Player') {
            this.moveDir *= -1;
        }

        // Collides with Player
        if (otherCollider.node.name === 'Player') {
            let playerScript = otherCollider.node.getComponent('Player');
            if (playerScript) playerScript.growBig();
            this.node.destroy(); // Consumed
        }
    }
}
