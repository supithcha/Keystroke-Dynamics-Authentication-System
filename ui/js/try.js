let stored_avg_CPM_user = 255.198;
let stored_avg_UD_user = 235.111;
let stored_avg_DU_user = 235.111;
let stored_avg_CPM_pass = 250.614;
let stored_avg_UD_pass = 239.412;
let stored_avg_DU_pass = 239.412;

let avg_CPM_user = 259.803;
let avg_UD_user = 230.944;
let avg_DU_user = 230.944;
let avg_CPM_pass = 258.032;
let avg_UD_pass = 232.529;
let avg_DU_pass = 232.529;

let similarity_user = Math.abs(stored_avg_CPM_user - avg_CPM_user) +
                      Math.abs(stored_avg_UD_user - avg_UD_user) +
                      Math.abs(stored_avg_DU_user - avg_DU_user);

let similarity_pass = Math.abs(stored_avg_CPM_pass - avg_CPM_pass) +
                      Math.abs(stored_avg_UD_pass - avg_UD_pass) +
                      Math.abs(stored_avg_DU_pass - avg_DU_pass);

console.log('Similarity User:', similarity_user);
console.log('Similarity Pass:', similarity_pass);

let threshold = 0.1; // Adjust as needed

if (similarity_user >= threshold && similarity_pass >= threshold) {
	console.log('good');
} else {
	console.log('bad');
}

function calculateSimilarity(storedKeystrokes, capturedKeystrokes) {
    if (!capturedKeystrokes || capturedKeystrokes.length === 0) {
        return 0; // Return 0 if capturedKeystrokes is null or empty
    }
    const m = storedKeystrokes.length;
    const n = capturedKeystrokes.length;

    let dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        dp[i][0] = i;
    }

    for (let j = 1; j <= n; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (storedKeystrokes[i - 1] === capturedKeystrokes[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + 1
                );
            }
        }
    }

    return 1 - dp[m][n] / Math.max(m, n);
}
