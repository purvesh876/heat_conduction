// // heat2d.cpp — FDM backend
// // Compile: g++ -O2 -o heat2d heat2d.cpp
// // Input (stdin):  N  top  bottom  left  right
// //   N = number of NODES per side (pass gridSize+1 from frontend)
// // Output (stdout): JSON with full grid + metadata

// #include <iostream>
// #include <vector>
// #include <iomanip>
// using namespace std;

// int main() {
//     int N;
//     double top, bottom, left, right;

//     // Read all inputs from stdin in one line
//     cin >> N >> top >> bottom >> left >> right;

//     if (N < 2 || N > 51) {
//         cout << "{\"error\":\"Grid size N must be 2–51\"}" << endl;
//         return 1;
//     }

//     // Initialize grid with average of boundary temps
//     double avg = (top + bottom + left + right) / 4.0;
//     vector<vector<double>> T(N, vector<double>(N, avg));

//     // Apply boundary conditions
//     for (int j = 0; j < N; j++) {
//         T[0][j]     = top;
//         T[N-1][j]   = bottom;
//     }
//     for (int i = 0; i < N; i++) {
//         T[i][0]     = left;
//         T[i][N-1]   = right;
//     }

//     // Jacobi FDM solver — 5000 iterations (same as original C++ code)
//     int iterations = 5000;
//     for (int k = 0; k < iterations; k++) {
//         for (int i = 1; i < N-1; i++) {
//             for (int j = 1; j < N-1; j++) {
//                 T[i][j] = (T[i+1][j] + T[i-1][j] +
//                            T[i][j+1] + T[i][j-1]) / 4.0;
//             }
//         }
//     }

//     // Compute min/max for color scale
//     double minT = T[0][0], maxT = T[0][0];
//     for (int i = 0; i < N; i++)
//         for (int j = 0; j < N; j++) {
//             if (T[i][j] < minT) minT = T[i][j];
//             if (T[i][j] > maxT) maxT = T[i][j];
//         }

//     // Output full grid as JSON
//     cout << fixed << setprecision(6);
//     cout << "{";
//     cout << "\"iterations\":" << iterations << ",";
//     cout << "\"minT\":" << minT << ",";
//     cout << "\"maxT\":" << maxT << ",";
//     cout << "\"grid\":[";
//     for (int i = 0; i < N; i++) {
//         cout << "[";
//         for (int j = 0; j < N; j++) {
//             cout << T[i][j];
//             if (j < N-1) cout << ",";
//         }
//         cout << "]";
//         if (i < N-1) cout << ",";
//     }
//     cout << "]}";
//     cout << endl;

//     return 0;
// }






// // heat2d.cpp — Gauss-Seidel FDM backend
// // Compile: g++ -O2 heat2d.cpp -o heat2d

// #include <iostream>
// #include <vector>
// #include <iomanip>
// #include <cmath>

// using namespace std;

// int main() {

//     int N;
//     double top, bottom, left, right;

//     // Input from Node.js
//     cin >> N >> top >> bottom >> left >> right;

//     if (N < 2 || N > 101) {
//         cout << "{\"error\":\"Grid size must be between 2 and 101\"}";
//         return 1;
//     }

//     vector<vector<double>> T(N, vector<double>(N,0));

//     // Apply boundary conditions
//     for(int j=0;j<N;j++){
//         T[0][j] = top;
//         T[N-1][j] = bottom;
//     }

//     for(int i=0;i<N;i++){
//         T[i][0] = left;
//         T[i][N-1] = right;
//     }

//     int iterations = 0;
//     int maxIter = 10000;
//     double tolerance = 1e-4;

//     // Gauss-Seidel solver
//     for(iterations = 0; iterations < maxIter; iterations++){

//         double maxError = 0.0;

//         for(int i=1;i<N-1;i++){
//             for(int j=1;j<N-1;j++){

//                 double oldValue = T[i][j];

//                 T[i][j] =
//                 (T[i+1][j] +
//                  T[i-1][j] +
//                  T[i][j+1] +
//                  T[i][j-1]) / 4.0;

//                 double error = fabs(T[i][j] - oldValue);

//                 if(error > maxError)
//                     maxError = error;
//             }
//         }

//         if(maxError < tolerance)
//             break;
//     }

//     // Find min/max
//     double minT = T[0][0];
//     double maxT = T[0][0];

//     for(int i=0;i<N;i++){
//         for(int j=0;j<N;j++){
//             if(T[i][j] < minT) minT = T[i][j];
//             if(T[i][j] > maxT) maxT = T[i][j];
//         }
//     }

//     // Output JSON
//     cout << fixed << setprecision(2);

//     cout << "{";
//     cout << "\"iterations\":" << iterations << ",";
//     cout << "\"minT\":" << minT << ",";
//     cout << "\"maxT\":" << maxT << ",";
//     cout << "\"grid\":[";

//     for(int i=0;i<N;i++){
//         cout << "[";
//         for(int j=0;j<N;j++){
//             cout << T[i][j];
//             if(j < N-1) cout << ",";
//         }
//         cout << "]";
//         if(i < N-1) cout << ",";
//     }

//     cout << "]}";

//     return 0;
// }




// // heat2d.cpp — FDM backend
// // Compile: g++ -O2 -o heat2d heat2d.cpp
// // Input (stdin):  N  top  bottom  left  right
// //   N = number of NODES per side (pass gridSize+1 from frontend)
// // Output (stdout): JSON with full grid + metadata

// #include <iostream>
// #include <vector>
// #include <iomanip>
// using namespace std;

// int main() {
//     int N;
//     double top, bottom, left, right;

//     // Read all inputs from stdin in one line
//     cin >> N >> top >> bottom >> left >> right;

//     if (N < 2 || N > 201) {
//         cout << "{\"error\":\"Grid size N must be 2–201\"}" << endl;
//         return 1;
//     }

//     // Initialize grid with average of boundary temps
//     double avg = (top + bottom + left + right) / 4.0;
//     vector<vector<double>> T(N, vector<double>(N, avg));

//     // Apply boundary conditions
//     for (int j = 0; j < N; j++) {
//         T[0][j]     = top;
//         T[N-1][j]   = bottom;
//     }
//     for (int i = 0; i < N; i++) {
//         T[i][0]     = left;
//         T[i][N-1]   = right;
//     }

//     // Jacobi FDM solver — 5000 iterations (same as original C++ code)
//     int iterations = 5000;
//     for (int k = 0; k < iterations; k++) {
//         for (int i = 1; i < N-1; i++) {
//             for (int j = 1; j < N-1; j++) {
//                 T[i][j] = (T[i+1][j] + T[i-1][j] +
//                            T[i][j+1] + T[i][j-1]) / 4.0;
//             }
//         }
//     }

//     // Compute min/max for color scale
//     double minT = T[0][0], maxT = T[0][0];
//     for (int i = 0; i < N; i++)
//         for (int j = 0; j < N; j++) {
//             if (T[i][j] < minT) minT = T[i][j];
//             if (T[i][j] > maxT) maxT = T[i][j];
//         }

//     // Output full grid as JSON
//     cout << fixed << setprecision(6);
//     cout << "{";
//     cout << "\"iterations\":" << iterations << ",";
//     cout << "\"minT\":" << minT << ",";
//     cout << "\"maxT\":" << maxT << ",";
//     cout << "\"grid\":[";
//     for (int i = 0; i < N; i++) {
//         cout << "[";
//         for (int j = 0; j < N; j++) {
//             cout << T[i][j];
//             if (j < N-1) cout << ",";
//         }
//         cout << "]";
//         if (i < N-1) cout << ",";
//     }
//     cout << "]}";
//     cout << endl;

//     return 0;
// }


// heat2d.cpp  —  Gauss-Seidel FDM backend
// Compile:  g++ -O2 -o heat2d heat2d.cpp
//
// stdin  : N  top  bottom  left  right
//   N    = node count per side  (frontend sends gridSize + 1)
//   max  : N = 1001  (1000×1000 boxes)
//
// stdout : compact JSON  { iterations, converged, minT, maxT, grid[] }
//   grid is a FLAT array row-major: grid[i*N + j]
//   precision: 3 dp (saves ~40% payload vs 6 dp)

#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>
using namespace std;

int main() {

    int N;
    double top, bottom, left_t, right_t;
    cin >> N >> top >> bottom >> left_t >> right_t;

    if (N < 2 || N > 1001) {
        cout << "{\"error\":\"N must be 2–1001\"}" << endl;
        return 1;
    }

    // ── Flat 1-D array: T[i*N + j]  (row-major, cache-friendly) ──────
    vector<double> T(N * N, (top + bottom + left_t + right_t) / 4.0);

    // Apply boundary conditions
    for (int j = 0; j < N; j++) {
        T[0 * N + j]       = top;     // top row
        T[(N-1) * N + j]   = bottom;  // bottom row
    }
    for (int i = 0; i < N; i++) {
        T[i * N + 0]       = left_t;  // left col
        T[i * N + (N-1)]   = right_t; // right col
    }

    // ── Gauss-Seidel iteration ────────────────────────────────────────
    // Uses updated values immediately  →  ~2× faster convergence vs Jacobi
    const int    MAX_ITER = 10000;
    const double TOL      = 1e-5;   // good for engineering accuracy
    int    iter      = 0;
    bool   converged = false;

    for (; iter < MAX_ITER; iter++) {
        double maxDiff = 0.0;

        for (int i = 1; i < N-1; i++) {
            for (int j = 1; j < N-1; j++) {
                double newVal =
                    (T[(i-1)*N + j] +   // top    (already updated this iter)
                     T[(i+1)*N + j] +   // bottom (old value)
                     T[i*N + (j-1)] +   // left   (already updated this iter)
                     T[i*N + (j+1)])    // right  (old value)
                    / 4.0;

                double diff = fabs(newVal - T[i*N + j]);
                if (diff > maxDiff) maxDiff = diff;

                T[i*N + j] = newVal;   // in-place update = Gauss-Seidel
            }
        }

        if (maxDiff < TOL) {
            iter++;
            converged = true;
            break;
        }
    }

    // ── Min / max for colour scale ────────────────────────────────────
    double minT = T[0], maxT = T[0];
    for (int k = 0; k < N * N; k++) {
        if (T[k] < minT) minT = T[k];
        if (T[k] > maxT) maxT = T[k];
    }

    // ── Output compact JSON ───────────────────────────────────────────
    // Flat array output keeps the JSON simple and avoids nested brackets.
    // Frontend reconstructs rows with  T[i][j] = grid[i*N + j]
    cout << fixed << setprecision(3);   // 3 dp: saves payload, plenty of precision
    cout << "{"
         << "\"N\":"          << N           << ","
         << "\"iterations\":" << iter        << ","
         << "\"converged\":"  << (converged ? "true" : "false") << ","
         << "\"minT\":"       << minT        << ","
         << "\"maxT\":"       << maxT        << ","
         << "\"grid\":[";

    for (int k = 0; k < N * N; k++) {
        cout << T[k];
        if (k < N * N - 1) cout << ',';
    }
    cout << "]}" << endl;

    return 0;
}