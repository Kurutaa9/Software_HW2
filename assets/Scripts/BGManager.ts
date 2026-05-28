const {ccclass, property} = cc._decorator;

@ccclass
export default class BGMManager extends cc.Component {

    @property(cc.AudioClip)
    bgm: cc.AudioClip = null;

    @property
    loop: boolean = true;

    @property
    volume: number = 1.0;

    start () {
        if (this.bgm) {
            cc.audioEngine.playMusic(this.bgm, this.loop);
            cc.audioEngine.setMusicVolume(this.volume);
        }
    }
}