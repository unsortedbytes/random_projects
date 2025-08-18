#include<bits/stdc++.h>
using namespace std;

const char validChars[7]={'I', 'V', 'X', 'L', 'C', 'D', 'M'}; 
const map<string, int> value_map = {
    {"I", 1},
    {"V", 5},
    {"X", 10},
    {"L", 50},
    {"C", 100},
    {"D", 500},
    {"M",1000},
    {"IV", 4},
    {"IX", 9},
    {"XL", 40},
    {"XC", 90},
    {"CD", 400},
    {"CM", 900},
};

int total(vector<string> input){
    int sum =0;
    for(int i =0;i<input.size();i++){
        sum +=value_map.at(input[i]);
    }
    return sum;
}

bool valid_sequence(vector<string> input){
    for(int i =0;i<input.size()-1;i++){
        if(value_map.at(input[i]) < value_map.at(input[i+1])){
            return false;
        }
        if(input[i] == "IV" || input[i] == "IX"){
            if(input[i+1] =="I" || input[i] ==input[i+1]) return false;
        }
        if(input[i] =="XL" || input[i] == "XC"){
            if(input[i+1] =="X" || input[i] == input[i+1]) return false;
        }
        if(input[i]=="CD" || input[i]=="CM"){
            if(input[i+1] == "C" ||  input[i] == input[i+1]) return false;
        }
    }
    return true;
}

void to_uppercase(string &input){
    transform(input.begin(), input.end(),input.begin(), [](unsigned char c){
        return toupper(c);
    } );
}

bool repetition_rule(string input){

    for(int i =0;i<input.size();i++){
        //bool valid = true;
    
        if(input[i] == 'V' || input[i] =='L' || input[i] =='D'){
            if((i>0 &&input[i] == input[i-1]) || (i<input.size() -1 && input[i] == input[i+1])){
                return false;
            }
        }else {
            if((i>0 && input[i] == input[i-1]) && (i<input.size() -1 &&input[i]==input[i+1])){
                if(i>1 && input[i-2]==input[i]) return false;
                if(i<input.size() -2 && input[i+2] == input[i]) return false;
            }
        }
        
        // return true;
    }    
    return true;
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

vector<string> get_seprate_value(string s){
    vector<string> value_set;
    for(int i=0;i<s.size();i++){
        if(s[i] == 'I'){
            if(i<s.size()-1 && (s[i+1]=='V' || s[i+1] == 'X')){
                // string temp = ""+s[i] + s[i+1];
                string temp = string(1, s[i]) + s[i+1];
                value_set.push_back(temp);
                i++;
            }else{
                //string temp = ""+s[i];
                string temp = string(1, s[i]);
                value_set.push_back(temp);
            }
        }else if(s[i] == 'X'){
            if(i<s.size()-1 && (s[i+1]=='L' || s[i+1] == 'C')){
                //string temp =""+ s[i] + s[i+1];
                string temp = string(1, s[i]) + s[i+1];
                value_set.push_back(temp);
                i++;
            }else{
                //string temp = ""+s[i];
                string temp = string(1, s[i]);
                value_set.push_back(temp);
            }
        }else if(s[i] == 'C'){
            if(i<s.size()-1 && (s[i+1]=='D' || s[i+1] == 'M')){
                //string temp =""+ s[i] + s[i+1];
                string temp = string(1, s[i])+s[i+1];
                value_set.push_back(temp);
                i++;
            }else{
                //string temp = ""+s[i];
                string temp = string(1, s[i]);
                value_set.push_back(temp);
            }
        }else {
            //string temp = ""+s[i];
            string temp = string(1, s[i]);
            value_set.push_back(temp);
        }
    }
    return value_set;
}

int main(){
    string c;
    while(cin>>c){
        to_uppercase(c);
        cout<<endl<<c<<endl<<endl;

        bool valid_or_not = check_valid_charaters(c);
        if(!valid_or_not){
            cout<<"Invaild Character"<<endl;
            // return 0;
            continue;
        }
        if(!repetition_rule(c)){
            cout<<"Failed repetition rule"<<endl<<endl;
            continue;
        }
        vector<string> value = get_seprate_value(c);
        for(int i =0;i<value.size();++i){
            cout<<value[i]<<endl;
        }
        cout<<endl<<endl;
        
        if(!valid_sequence(value)){
            cout<<"Not a valid sequence"<<endl<<endl;
            continue;
        }

        int sum =  total(value);
        cout<<endl<<endl<<sum<<endl<<endl;
    }
}
