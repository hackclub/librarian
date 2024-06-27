function generateMessageString(messages) {
    // Sort messages by date just in case they are not sorted
    messages.sort((a, b) => new Date(a.date) - new Date(b.date));

    let result = '';
    let lastTimestamp = new Date(messages[0].date).getTime();
    
    for (let i = 1; i < messages.length; i++) {
        let currentTimestamp = new Date(messages[i].date).getTime();
        let diffSeconds = (currentTimestamp - lastTimestamp) / 1000;

        // Calculate the number of 10-second intervals
        let intervals = Math.floor(diffSeconds / 10);

        // Add the emoji and dashes to the result
        result += '✉️' + '-'.repeat(intervals);

        // Update the last timestamp
        lastTimestamp = currentTimestamp;
    }

    // Add the emoji for the last message
    result += '✉️';

    return result;
}

// Example usage
let messages = [
    { date: "2024-06-27T15:26:10.200Z", link: "https://chat.example/l/1" },
    { date: "2024-06-27T15:26:20.200Z", link: "https://chat.example/l/2" },
    { date: "2024-06-27T15:26:30.200Z", link: "https://chat.example/l/3" },
    { date: "2024-06-27T15:26:40.200Z", link: "https://chat.example/l/4" },
    { date: "2024-06-27T15:27:50.200Z", link: "https://chat.example/l/5" }
];

console.log(generateMessageString(messages)); // Output: ✉️✉️✉
