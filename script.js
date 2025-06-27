
// Sorting Visualizer JavaScript
class SortingVisualizer {
    constructor() {
        // Get DOM elements
        this.arrayContainer = document.getElementById('array-container');
        this.algorithmSelect = document.getElementById('algorithm-select');
        this.speedSelect = document.getElementById('speed-select');
        this.generateBtn = document.getElementById('generate-btn');
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        
        // Initialize state
        this.array = [];
        this.isSorting = false;
        this.shouldStop = false;
        this.animationSpeed = 150;
        
        // Bind event listeners
        this.bindEvents();
        
        // Generate initial array
        this.generateNewArray();
    }
    
    // Bind all event listeners
    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateNewArray());
        this.startBtn.addEventListener('click', () => this.startSorting());
        this.stopBtn.addEventListener('click', () => this.stopSorting());
        this.speedSelect.addEventListener('change', (e) => {
            this.animationSpeed = parseInt(e.target.value);
        });
    }
    
    // Generate a new random array
    generateNewArray() {
        if (this.isSorting) return;
        
        // Clear existing array
        this.array = [];
        this.arrayContainer.innerHTML = '';
        
        // Generate random numbers
        const arraySize = window.innerWidth < 768 ? 20 : 30;
        for (let i = 0; i < arraySize; i++) {
            const value = Math.floor(Math.random() * 250) + 10;
            this.array.push({
                value: value,
                state: 'unsorted' // unsorted, comparing, swapping, sorted
            });
        }
        
        // Render the array
        this.renderArray();
    }
    
    // Render the array as bars
    renderArray() {
        this.arrayContainer.innerHTML = '';
        
        this.array.forEach((element, index) => {
            const bar = document.createElement('div');
            bar.className = `array-bar ${element.state}`;
            bar.style.height = `${element.value}px`;
            bar.style.width = `${Math.max(800 / this.array.length - 2, 8)}px`;
            bar.setAttribute('data-value', element.value);
            bar.textContent = element.value < 50 ? '' : element.value;
            
            this.arrayContainer.appendChild(bar);
        });
    }
    
    // Sleep function for animation delay
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Update array state and re-render
    async updateArray() {
        this.renderArray();
        await this.sleep(this.animationSpeed);
    }
    
    // Start sorting with selected algorithm
    async startSorting() {
        if (this.isSorting) return;
        
        this.isSorting = true;
        this.shouldStop = false;
        
        // Update button states
        this.startBtn.disabled = true;
        this.generateBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.algorithmSelect.disabled = true;
        
        // Reset array states
        this.array.forEach(element => element.state = 'unsorted');
        await this.updateArray();
        
        // Get selected algorithm
        const algorithm = this.algorithmSelect.value;
        
        try {
            switch (algorithm) {
                case 'bubble':
                    await this.bubbleSort();
                    break;
                case 'selection':
                    await this.selectionSort();
                    break;
                case 'insertion':
                    await this.insertionSort();
                    break;
            }
            
            // Mark all as sorted if completed
            if (!this.shouldStop) {
                this.array.forEach(element => element.state = 'sorted');
                await this.updateArray();
            }
        } catch (error) {
            console.log('Sorting was stopped');
        }
        
        // Reset button states
        this.isSorting = false;
        this.startBtn.disabled = false;
        this.generateBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.algorithmSelect.disabled = false;
    }
    
    // Stop sorting
    stopSorting() {
        this.shouldStop = true;
    }
    
    // Check if sorting should stop
    checkStop() {
        if (this.shouldStop) {
            throw new Error('Sorting stopped');
        }
    }
    
    // Bubble Sort Algorithm
    async bubbleSort() {
        const n = this.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                this.checkStop();
                
                // Mark elements being compared
                this.array[j].state = 'comparing';
                this.array[j + 1].state = 'comparing';
                await this.updateArray();
                
                // Compare and swap if needed
                if (this.array[j].value > this.array[j + 1].value) {
                    // Mark as swapping
                    this.array[j].state = 'swapping';
                    this.array[j + 1].state = 'swapping';
                    await this.updateArray();
                    
                    // Perform swap
                    [this.array[j], this.array[j + 1]] = [this.array[j + 1], this.array[j]];
                    await this.updateArray();
                }
                
                // Reset states
                this.array[j].state = 'unsorted';
                this.array[j + 1].state = 'unsorted';
            }
            
            // Mark last element as sorted
            this.array[n - 1 - i].state = 'sorted';
            await this.updateArray();
        }
        
        // Mark first element as sorted
        this.array[0].state = 'sorted';
        await this.updateArray();
    }
    
    // Selection Sort Algorithm
    async selectionSort() {
        const n = this.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let minIndex = i;
            this.array[i].state = 'comparing';
            
            // Find minimum element in remaining array
            for (let j = i + 1; j < n; j++) {
                this.checkStop();
                
                this.array[j].state = 'comparing';
                await this.updateArray();
                
                if (this.array[j].value < this.array[minIndex].value) {
                    if (minIndex !== i) {
                        this.array[minIndex].state = 'unsorted';
                    }
                    minIndex = j;
                } else {
                    this.array[j].state = 'unsorted';
                }
            }
            
            // Swap if needed
            if (minIndex !== i) {
                this.array[i].state = 'swapping';
                this.array[minIndex].state = 'swapping';
                await this.updateArray();
                
                [this.array[i], this.array[minIndex]] = [this.array[minIndex], this.array[i]];
                await this.updateArray();
            }
            
            // Clear states and mark as sorted
            this.array.forEach(element => {
                if (element.state !== 'sorted') {
                    element.state = 'unsorted';
                }
            });
            this.array[i].state = 'sorted';
            await this.updateArray();
        }
        
        // Mark last element as sorted
        this.array[n - 1].state = 'sorted';
        await this.updateArray();
    }
    
    // Insertion Sort Algorithm
    async insertionSort() {
        const n = this.array.length;
        
        // First element is considered sorted
        this.array[0].state = 'sorted';
        await this.updateArray();
        
        for (let i = 1; i < n; i++) {
            this.checkStop();
            
            let key = { ...this.array[i] };
            let j = i - 1;
            
            // Mark key element
            this.array[i].state = 'comparing';
            await this.updateArray();
            
            // Move elements that are greater than key
            while (j >= 0 && this.array[j].value > key.value) {
                this.checkStop();
                
                this.array[j].state = 'comparing';
                await this.updateArray();
                
                // Shift element to right
                this.array[j + 1] = { ...this.array[j], state: 'swapping' };
                await this.updateArray();
                
                this.array[j + 1].state = 'unsorted';
                this.array[j].state = 'unsorted';
                j--;
            }
            
            // Place key in correct position
            this.array[j + 1] = { ...key, state: 'sorted' };
            await this.updateArray();
        }
        
        // Mark all as sorted
        this.array.forEach(element => element.state = 'sorted');
        await this.updateArray();
    }
}

// Initialize the visualizer when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SortingVisualizer();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Regenerate array on significant size changes
    const visualizer = window.sortingVisualizer;
    if (visualizer && !visualizer.isSorting) {
        setTimeout(() => visualizer.generateNewArray(), 100);
    }
});
