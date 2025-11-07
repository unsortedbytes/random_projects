#include<iostream>
#include<cmath>
#include<iomanip>
using namespace std;

double sqrtApprox(double a, double b, double tol  = 1e-12, int maxIter = 10000){
    if(a <= 0  || b<=0){
        throw invalid_argument("Both a and b must be postive.");
    }
    if (b>=a){
        throw invalid_argument("Required 0 < b < a for  convergence.");
    }


    double x = a;
    double y = b;


    for (int i = 0;i< maxIter;i++){
        double x_next = (x+y)/2.0;
        double y_next = (2.0*x*y)/(x+y);


        // check for the convergence

        if(fabs(x_next - y_next)< tol){
            return (x_next+y_next)/2.0;
        }

        x = x_next;
        y = y_next;
    }

    // If the max iteration reached;
    return (x+y)/2.0;

}


int main(){
    double a = 3.0;
    double b = 1.0;

    // cout<<fixed<<setprecision(12);// fixed tell the compier to print into the fixed floating point no not in the f
    // cout<<b<<endl;

    try{
        double approx = sqrtApprox(a, b);
        cout<< fixed<< setprecision(12);
        cout<< "Approximation of Sqrt("<< a<< " * "<< b<< ") = "<< approx<< endl;
        cout<< "Actual sqrt(ab) = "<< sqrt(a*b)<<endl;
    }catch(const invalid_argument& e){
        cerr<< "Error: "<<e.what()<<endl;
    }
}