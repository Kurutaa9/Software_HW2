const {ccclass, property} = cc._decorator;

@ccclass
export default class QuestionBlock extends cc.Component {
    @property(cc.Prefab)
    mushroomPrefab: cc.Prefab = null;

    private isUsed: boolean = false;

    onLoad() {
        this.node.on('bump', this.onBumped, this);
    }

    onBumped() {
        if (this.isUsed) return;
        this.isUsed = true;

        // Replace with a "used" static block frame if needed
        // this.getComponent(cc.Sprite).spriteFrame = emptyBlockSprite;

        // Block pop animation when hit
        this.node.runAction(cc.sequence(
            cc.moveBy(0.1, 0, 10),
            cc.moveBy(0.1, 0, -10)
        ));

        // Spawn Super Mushroom
        if (this.mushroomPrefab) {
            let mushroom = cc.instantiate(this.mushroomPrefab);
            mushroom.setPosition(this.node.position.x, this.node.position.y + 32);
            
            // Add to the same parent as the block
            this.node.parent.addChild(mushroom);
        }
    }
    
}
