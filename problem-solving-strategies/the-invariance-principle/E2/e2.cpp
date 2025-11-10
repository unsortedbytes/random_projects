#include<bits/stdc++.h>

#include<vector>
#include<iostream>
#include<cstdlib>
#include<ctime>
#include<cmath>
using namespace std;

int remainingNumber(int n)
{
    vector<int> numbers;

    for(int i=1;i<=2*n;i++){
        numbers.push_back(i);
    }

    // Random selection and putting it into the box
    while(numbers.size()>1){
        int size = numbers.size();

        // Pick two distinct random indices

        int i = rand()%size;
        int j = rand()%size;

        while(j == i) j = rand()%size;

        int a = numbers[i];
        int b = numbers[j];
        int diff = abs(a-b);

        if(i>j) swap(i, j);
        numbers.erase(numbers.begin()+j);
        numbers.erase(numbers.begin()+i);

        numbers.push_back(diff);
    }

    return numbers[0];
}
int main(){
    srand(time(0));// Seed random number generator

    int n;
    cout<<"Enter an odd postive integer n:";
    cin>>n;


    if(n%2 == 0){
        cout<<"n must be odd postive integer n:";
        return n;
    }

    int result = remainingNumber(n);
    cout<< "Final remaining number: "<< result <<endl;

    if(result %2 == 1){
        cout<<"The Final number is Odd"<<endl;
    }else{
        cout<<"The Final number is Even."<<endl;
    }


    return 0;

}