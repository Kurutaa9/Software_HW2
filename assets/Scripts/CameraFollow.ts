const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {
    @property(cc.Node)
    target: cc.Node = null;

    @property
    minX: number = 0; // The leftmost coordinate the camera is allowed to go

    private initialY: number = 0;

    onLoad () {
        // Save the camera's fixed Y positioning
        this.initialY = this.node.y;
    }

    update (dt) {
        if (!this.target) return;
        
        let targetPos = this.target.getPosition();
        
        // Clamp the Camera's X so it never goes further left than minX
        let clampedX = Math.max(targetPos.x, this.minX);
        
        // Follow the player's X position, but keep the camera's original Y position for the floor alignment
        this.node.setPosition(clampedX, this.initialY);
    }
}

