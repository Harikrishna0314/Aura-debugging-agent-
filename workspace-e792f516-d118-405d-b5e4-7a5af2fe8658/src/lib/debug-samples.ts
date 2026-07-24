// A library of intentionally buggy code samples for the "Try a sample" feature.
// Each sample showcases a different kind of bug the AI agent can catch.

export interface SampleCode {
  id: string;
  language: string;
  title: string;
  hint: string;
  code: string;
}

export const SAMPLE_CODES: SampleCode[] = [
  {
    id: "py-binary-search",
    language: "python",
    title: "Python · Binary Search infinite loop",
    hint: "Search keeps looping forever or misses the target.",
    code: `def binary_search(arr, target):
    low = 0
    high = len(arr)
    while low <= high:
        mid = (low + high) / 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid
        else:
            high = mid
    return -1

print(binary_search([1, 3, 5, 7, 9], 7))`,
  },
  {
    id: "js-async-loop",
    language: "javascript",
    title: "JavaScript · Async loop closure bug",
    hint: "Logs the wrong number for each item.",
    code: `const items = [1, 2, 3, 4, 5];

for (var i = 0; i < items.length; i++) {
  setTimeout(() => {
    console.log("Item:", items[i]);
  }, 100);
}`,
  },
  {
    id: "js-factorial",
    language: "javascript",
    title: "JavaScript · Recursion never ends",
    hint: "Stack overflow / wrong result for factorial.",
    code: `function factorial(n) {
  if (n = 0) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5));`,
  },
  {
    id: "cpp-array-sum",
    language: "cpp",
    title: "C++ · Off-by-one & overflow",
    hint: "Wrong sum and undefined behaviour.",
    code: `#include <iostream>
using namespace std;

int sumArray(int arr[], int n) {
    int total = 0;
    for (int i = 0; i <= n; i++) {
        total += arr[i];
    }
    return total;
}

int main() {
    int data[5] = {10, 20, 30, 40, 50};
    cout << "Sum = " << sumArray(data, 5) << endl;
    return 0;
}`,
  },
  {
    id: "java-null-check",
    language: "java",
    title: "Java · NullPointerException waiting to happen",
    hint: "Crashes when the list is empty.",
    code: `import java.util.List;

public class Stats {
    public static double average(List<Integer> nums) {
        int sum = 0;
        for (int n : nums) {
            sum += n;
        }
        return sum / nums.size();
    }

    public static void main(String[] args) {
        System.out.println(average(List.of()));
    }
}`,
  },
  {
    id: "sql-injection",
    language: "sql",
    title: "SQL · String-concatenated query (security)",
    hint: "Vulnerable to SQL injection and crashes on empty name.",
    code: `-- Get user by name (application builds: "SELECT * FROM users WHERE name = '" + name + "'")
SELECT * FROM users WHERE name = 'O''Brien';
-- also returns every column including password_hash`,
  },
  {
    id: "ts-async-promise",
    language: "typescript",
    title: "TypeScript · Forgotten await",
    hint: "Returns a Promise instead of the value.",
    code: `async function fetchUser(id: number): Promise<User> {
  const res = await fetch("/api/users/" + id);
  return res.json();
}

async function greet(id: number): Promise<string> {
  const user = fetchUser(id); // should be awaited
  return "Hello, " + user.name;
}`,
  },
  {
    id: "go-goroutine",
    language: "go",
    title: "Go · Loop variable captured by goroutines",
    hint: "All goroutines print the same value.",
    code: `package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            fmt.Println(i)
        }()
    }
    wg.Wait()
}`,
  },
];

export function findSample(id: string): SampleCode | undefined {
  return SAMPLE_CODES.find((s) => s.id === id);
}
