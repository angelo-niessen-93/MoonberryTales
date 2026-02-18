class Monster extends MovableObject {
    
     constructor() {
        super().loadImage('../img/Skeleton/skeleton04_walk1.png');
        
        this.x = 200 + Math.random() * 500;
    }


}