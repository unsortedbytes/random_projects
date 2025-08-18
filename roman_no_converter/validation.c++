#include<bits/stdc++.h>
using namespace std;

const char validChars[7]={'I', 'V', 'X', 'L', 'C', 'D', 'M'};

void to_uppercase(string &input){
    transform(input.begin(), input.end(),input.begin(), [](unsigned char c){
        return toupper(c);
    } );
}



bool check_valid_charaters(string s){
    for(char c :s){
        bool found = false;
        for(char validChar : validChars){
            if(c==validChar){
                found = true;
                break;
            }
        }
        if(!found){
            return false;
        }
    }
   return true; 
}

// vector<string> get_numbers(string s){
//     vector<string> result;
//
// }

int main(){
    string c;
    cin>>c;
    to_uppercase(c);
    cout<<endl<<c<<endl;

    bool valid_or_not = check_valid_charaters(c);
    if(!valid_or_not){
        cout<<"Invaild Character"<<endl;
        return 0;
    }
}
