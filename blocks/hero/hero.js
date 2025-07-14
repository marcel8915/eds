export default function decorate(block) {
    console.log(block);
    const rows = block.querySelectorAll(':scope > div');
    rows.forEach((row) => {
        console.log('row', row);
    });
}
