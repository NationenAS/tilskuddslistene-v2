<div class=canvas-container>
    <div class=loading>
        <div class="spinner">
            <div></div>
            <div></div>
        </div>
    </div>
</div>

<style>
.loading {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
}
.spinner {
    width: 40px;
    height: 40px;
    position: relative;
    margin: 100px auto;
}
.spinner div {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #406619;
    position: absolute;
    top: 0;
    left: 0;
    animation: bounce 1.5s infinite ease-in-out;
}
.spinner div:nth-child(2) {
    animation-delay: -1.0s;
    border-color: #fcda51;
}
@keyframes bounce {
    0%, 100% { 
        transform: scale(0.3);
    } 50% { 
        transform: scale(1);
    }
}
</style>
