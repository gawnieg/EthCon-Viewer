## compute_input.py

import sys, json, numpy as np
def read_in2():

    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that


    return json.loads(lines[0])
#Read data from stdin
def read_in():
    store=[]
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    # print(lines[1])
    for line in lines:
        store.append(json.loads(line))

    return store

def main():
    #get our data as an array from read_in()
    print("reading in...")
    lines = read_in()
    # lines2=read_in2()
    print("python: just received: ",lines[0])
    colors=lines[1]
    print("colors is ",colors)
    # print("yurt")
    #create a numpy array
    # np_lines = np.array(lines)
    #
    # #use numpys sum method to find sum of all elements in the array
    # lines_sum = np.sum(np_lines)
    #
    # #return the sum to the output stream
    # print lines_sum

#start process
if __name__ == '__main__':
    main()
