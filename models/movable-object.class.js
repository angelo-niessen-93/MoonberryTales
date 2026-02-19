class MovableObject {
    x = 120;
    y = 310;
    img;
    height = 150;
    width = 100;
    imageCache = {};
    currentImage = 0;
    speed = 0;

    
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach(path => {

        let img = new Image();
        img.src = path;
        this.imageCache[path] = img;
        });
    }

    moveRight() {
        console.log('Moving right');
    }

    moveLeft(){
     setInterval(() => {
            this.x -= this.speed;

            if (this.x <= -this.width) {
                this.x = 0;
            }
        }, 1000 / 60);
    } 
}

