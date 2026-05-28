const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    public static instance: GameManager = null;

    @property(cc.Prefab)
    enemyPrefab: cc.Prefab = null;

    private enemySpawnData: { position: cc.Vec2 }[] = [];
    private enemyNodes: cc.Node[] = [];
    private questionBlockNodes: cc.Node[] = [];

    onLoad () {
        GameManager.instance = this;
    }

    start () {
        // Save all enemies' original positions and node references
        let enemies = cc.director.getScene().getComponentsInChildren('Enemy');
        enemies.forEach((e: any) => {
            this.enemySpawnData.push({ position: cc.v2(e.node.x, e.node.y) });
            this.enemyNodes.push(e.node);
        });

        // Save all question block nodes
        let blocks = cc.director.getScene().getComponentsInChildren('QuestionBlock');
        blocks.forEach((b: any) => {
            this.questionBlockNodes.push(b.node);
        });
    }

    public onPlayerDied () {
        this.scheduleOnce(() => {
            this.resetEnemies();
            this.resetQuestionBlocks();
        }, 2.5); // Matches the respawn delay in Player.ts
    }

    private resetEnemies () {
        this.enemySpawnData.forEach((data, index) => {
            let existingNode = this.enemyNodes[index];

            if (cc.isValid(existingNode)) {
                // Enemy is still alive, just reset it
                let enemyScript = existingNode.getComponent('Enemy') as any;
                if (enemyScript) enemyScript.reset(data.position);
            } else {
                // Enemy was stomped and destroyed, re-instantiate it
                if (this.enemyPrefab) {
                    let newEnemy = cc.instantiate(this.enemyPrefab);
                    newEnemy.setPosition(data.position.x, data.position.y);
                    cc.director.getScene().addChild(newEnemy);
                    this.enemyNodes[index] = newEnemy; // Update the reference
                }
            }
        });
    }

    private resetQuestionBlocks () {
        this.questionBlockNodes.forEach(node => {
            if (cc.isValid(node)) {
                let block = node.getComponent('QuestionBlock') as any;
                if (block) block.reset();
            }
        });
    }
}