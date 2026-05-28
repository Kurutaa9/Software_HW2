// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property
    moveSpeed: number = 300;

    @property
    jumpForce: number = 600;

    @property
    lives: number = 3;

    @property(cc.AudioClip)
    jumpSound: cc.AudioClip = null;

    @property(cc.AudioClip)
    dieSound: cc.AudioClip = null;

    private rb: cc.RigidBody = null;
    private anim: cc.Animation = null;
    private isGrounded: boolean = false;
    private moveDir: number = 0;
    private initialPosition: cc.Vec3 = cc.v3(0, 0, 0);
    public isDead: boolean = false;
    public isBig: boolean = false;
    public isInvincible: boolean = false;

    onLoad () {
        this.rb = this.getComponent(cc.RigidBody);
        
        // This is CRITICAL! If this is false, onBeginContact is never called, and the player can't detect the floor!
        this.rb.enabledContactListener = true; 
        
        // Fix for sticking to walls! Sets friction to 0
        let collider = this.getComponent(cc.PhysicsCollider);
        if (collider) {
            collider.friction = 0;
            collider.apply();
        }

        this.anim = this.getComponent(cc.Animation);
        this.initialPosition = this.node.position;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        
        // Enable Physics Engine
        cc.director.getPhysicsManager().enabled = true;
    }

    onDestroy () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown (event: cc.Event.EventKeyboard) {
        if (this.isDead) return;
        let walkClip = this.isBig ? 'big_walk' : 'walk';

        switch(event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.moveDir = -1;
                this.node.scaleX = -Math.abs(this.node.scaleX);
                if (this.isGrounded && this.anim) {
                    if (this.anim.currentClip === null || this.anim.currentClip.name !== walkClip) {
                         this.anim.play(walkClip);
                    }
                }
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.moveDir = 1;
                this.node.scaleX = Math.abs(this.node.scaleX);
                if (this.isGrounded && this.anim) {
                    if (this.anim.currentClip === null || this.anim.currentClip.name !== walkClip) {
                         this.anim.play(walkClip);
                    }
                }
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
            case cc.macro.KEY.space:
                this.jump();
                break;
        }
    }

    onKeyUp (event: cc.Event.EventKeyboard) {
        switch(event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                if (this.moveDir === -1) {
                    this.moveDir = 0;
                    if (this.isGrounded && this.anim) this.anim.play(this.isBig ? 'big_idle' : 'idle');
                }
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                if (this.moveDir === 1) {
                    this.moveDir = 0;
                    if (this.isGrounded && this.anim) this.anim.play(this.isBig ? 'big_idle' : 'idle');
                }
                break;
        }
    }

    jump () {
        if (this.isGrounded && !this.isDead) { // Restored the isGrounded check so you can't infinite jump
            this.rb.linearVelocity = cc.v2(this.rb.linearVelocity.x, this.jumpForce);
            this.isGrounded = false;
            let jumpClip = this.isBig ? 'big_jump' : 'jump';
            if (this.anim) this.anim.play(jumpClip);
            if (this.jumpSound) cc.audioEngine.playEffect(this.jumpSound, false);
            console.log("JUMP TRIGGERED!");
        }
    }

    update (dt) {
        if (this.isDead) return;

        // Apply movement velocity
        let velocity = this.rb.linearVelocity;
        velocity.x = this.moveDir * this.moveSpeed;
        this.rb.linearVelocity = velocity;

        // If Mario is moving upwards or falling significantly, he is not on the ground!
        // This prevents mid-air jumps if the player simply walks off a ledge.
        if (Math.abs(velocity.y) > 5) {
            this.isGrounded = false;
        }

        // Out of bounds checking (falling off the map)
        if (this.node.y < -500) {
            this.die();
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        let otherGroup = otherCollider.node.group;
        let normal = contact.getWorldManifold().normal;
        
        // Let's rely entirely on World Coordinates. This absolutely avoids A/B normal inversion
        // and completely ignores varying center origins on tall pipes!
        let playerBottom = selfCollider.node.getBoundingBoxToWorld().yMin;
        let objectTop = otherCollider.node.getBoundingBoxToWorld().yMax;
        let objectBottom = otherCollider.node.getBoundingBoxToWorld().yMin;

        // Player standing on top (player's bottom is roughly resting on or slightly above object's top)
        // AND normal is vertical
        if (Math.abs(normal.y) > 0.5 && playerBottom >= objectTop - 5) {
            this.isGrounded = true;
            let idleClip = this.isBig ? 'big_idle' : 'idle';
            let walkClip = this.isBig ? 'big_walk' : 'walk';

            if (this.moveDir === 0 && this.anim && !this.isDead) {
                if (this.anim.currentClip === null || this.anim.currentClip.name !== idleClip) {
                    this.anim.play(idleClip);
                }
            } else if (this.anim && !this.isDead) {
                if (this.anim.currentClip === null || this.anim.currentClip.name !== walkClip) {
                    this.anim.play(walkClip);
                }
            }
        }

        // Enemy interaction
        if (otherGroup === 'enemy' || otherCollider.node.name === 'Enemy') {
            if (Math.abs(normal.y) > 0.5 && playerBottom >= objectTop - 5) {
                // We landed on top of the enemy (stomp)
                this.rb.linearVelocity = cc.v2(this.rb.linearVelocity.x, this.jumpForce * 0.8);
            } else {
                // If not stomping, we take damage
                if (!this.isInvincible) {
                    if (this.isBig) {
                        this.shrink();
                    } else {
                        this.die();
                    }
                }
            }
        }

        // Question block interaction (hitting from below)
        if (otherGroup === 'block' || otherCollider.node.name === 'QuestionBlock') {
            // Player's top hits object bottom
            let playerTop = selfCollider.node.getBoundingBoxToWorld().yMax;
            if (Math.abs(normal.y) > 0.5 && playerTop <= objectBottom + 5) {
                otherCollider.node.emit('bump');
            }
        }
    }

    die () {
        if (this.isDead) return;
        this.isDead = true;
        this.lives -= 1;
        
        
        if (this.dieSound) cc.audioEngine.playEffect(this.dieSound, false);
        
        if (this.anim) this.anim.play('die');

        // Disable all colliders so he falls through the floor
        let colliders = this.getComponents(cc.PhysicsCollider);
        colliders.forEach(c => c.enabled = false);
        
        // Stop horizontal movement, pop him up into the air
        this.rb.linearVelocity = cc.v2(0, 500);

        this.node.runAction(cc.sequence(
            cc.delayTime(2.5), // Wait a bit longer so he can fall off-screen
            cc.callFunc(() => { this.respawn(); })
        ));
    }

    growBig () {
        if (!this.isBig) {
            this.isBig = true;

            let collider = this.getComponent(cc.PhysicsBoxCollider);
            if (collider) {
                let oldHeight = collider.size.height;
                collider.size.height *= 2;
                // Shift the physics box up slightly so the engine only pushes him up by a quarter of his height, rather than a full half. 
                // This balances the difference between his original center point and his new sprite boundaries.
                collider.offset.y += oldHeight / 4; 
                collider.apply();
            }

            if (this.anim) {
                let clipToPlay = this.moveDir === 0 ? 'big_idle' : 'big_walk';
                this.anim.play(clipToPlay);
            }
        }
    }

    shrink () {
        if (this.isBig) {
            this.isBig = false;
            this.isInvincible = true;

            let collider = this.getComponent(cc.PhysicsBoxCollider);
            if (collider) {
                let currentHeight = collider.size.height;
                collider.size.height /= 2; 
                collider.offset.y -= currentHeight / 8; // Revert the exact offset we added
                collider.apply();
            }

            if (this.anim) {
                let clipToPlay = this.moveDir === 0 ? 'idle' : 'walk';
                this.anim.play(clipToPlay);
            }

            // Blinking effect for invincibility frames
            let blinkAction = cc.blink(1.5, 8); // blink for 1.5 seconds, 8 times
            let resetInvincibility = cc.callFunc(() => { 
                this.isInvincible = false; 
                this.node.opacity = 255;
            });
            this.node.runAction(cc.sequence(blinkAction, resetInvincibility));
        }
    }

    respawn () {
        if (this.lives > 0) {
            this.node.position = this.initialPosition;
            this.rb.linearVelocity = cc.v2(0, 0);
            this.isDead = false;
            this.isGrounded = false;
            this.isInvincible = false;
            this.node.opacity = 255;
            this.node.stopAllActions();
            
            // Re-enable collisions
            let colliders = this.getComponents(cc.PhysicsCollider);
            colliders.forEach(c => c.enabled = true);
            
            // Revert back to small mario
            if (this.isBig) {
                this.isBig = false;
                
                let collider = this.getComponent(cc.PhysicsBoxCollider);
                if (collider) {
                    let currentHeight = collider.size.height;
                    collider.size.height /= 2; 
                    collider.offset.y -= currentHeight / 8; // Revert the exact offset we added
                    collider.apply();
                }
            }
            
            if (this.anim) this.anim.play('idle');
        } else {
            console.log("Game Over! Load Game Over Scene.");
        }
    }
}

