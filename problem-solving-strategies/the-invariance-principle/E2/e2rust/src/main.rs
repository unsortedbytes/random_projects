use std::io;
use rand::Rng;
use std::mem;

fn remainingNumber(n: i32) -> i32 {
    let mut numbers = Vec::new();

    for i in 1..n {
        numbers.push(i);
    }

    while numbers.len() > 1 {
        let size = numbers.len();

        let mut rng  = rand::thread_rng();
        let mut i:usize = rng.gen_range(0..size);
        let mut j:usize = rng.gen_range(0..size);

        while j == i {
            j = rng.gen_range(0..size);
        }

        let a = numbers[i];
        let b = numbers[j];

        let diff = (a-b).abs();

        if i> j{
            mem::swap(&mut i, &mut j);
        }
        numbers.remove(j);
        numbers.remove(i);

        numbers.push(diff);


    }

    numbers[0]
}

fn main(){
    let mut input = String::new();
    println!("Enter an odd postive integer n:");

    io::stdin().read_line(&mut input).expect("Failed to read line");

    let num:i32 = input.trim().parse().expect("Please type a valid number!");

    if num %2 == 0 {
        println!("n must be odd postive integer");
        return ;
    }

    let result = remainingNumber(num);
    println!("{}", result);


}