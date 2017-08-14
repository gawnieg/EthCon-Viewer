import os, sys, json, numpy as np
import pymongo
con = pymongo.MongoClient()
coll = con.trans.test #collection route
from graph_tool.all import *

# python module called from generate_graph_for_contract
#Read data from stdin
def read_in():
    store=[]
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    for line in lines:
        # print(line)
        store.append(json.loads(line))
    return store # was json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    fromstdin = read_in()
    fileaddress=fromstdin[0];
    colorarray = fromstdin[1]
    labelarray = fromstdin[2]
    namingarray =fromstdin[3]
    #then load file
    #then split in memory according to "}"
    #then save into seperate files
    #then generate graph image for each
    print("python: loading file")
    with open(fileaddress,"r") as tf:
        print("python: opened file")
        a = tf.read() # a is all the graphs formatting for the block

    x = a.split("}") # split on } (aka end of dot file)
    res=[]
    i=0


    for y in x[:-1]:
        individColorArray=colorarray[i]
        #print("in loop!")
        y=y+"}" # put it back in!
        res.append(y)
        y=str(y)
        filename = namingarray[i] # the graph formats and the names <transHash_depthNum> are in order
        print("python: saving to " +filename)
        with open(filename, "w") as text_file:
            text_file.write(y)

        #now check if the file is already there
        fcheckname = "./public/pics/"+filename+".png"
        print("python: checking to see if graph is already there at "+ fcheckname)
        isthere = os.path.isfile(fcheckname) # this will be True if there file is already there
        edge_des_color = [0.9,0.9,0.8,0.9]#this is edge colour
        if(isthere==False):
            # now generate graphs from each file on disk
            ii=0 # second index needed for colour and label array
            print("python: no graph found ....generating graph...")
            try:
                g=load_graph(filename,"dot")#this should be the dot file contents but now we will just pass the file address
                # section setting labels!
                print("python: loaded graph from "+filename)
            except:
                print("python: error loading graph")
            try:
                v_prop=g.new_vertex_property("string") #for label
                v_prop_colour = g.new_vertex_property("string") #for colour
                vshape = g.new_vertex_property("string") # for first and last to have different shapes
                #assigning colours to each vertex in loop
                """
                hold_colour_array is an array of the way the load_graph parsed the input file
                hold_colour_array=[0, 1, 100, 101, 105, 106, 107, 108, 11, 111, 113, 115, 119, 12, 120, 122, 123, 124, 125, 129, 13, 130, 131, 132, 135, 137, 139, 14, 143, 144, 146, 147, 148, 149, 153, 154, 155, 156, 159, 16, 161, 163, 167, 168, 17, 170, 171, 172, 173, 177, 178, 179, 18, 180, 184, 186, 187, 19, 190, 191, 192, 194, 195, 199, 2, 200, 201, 203, 204, 205, 206, 209, 21, 211, 22, 25, 27, 28, 3, 33, 35, 36, 4, 40, 41, 42, 43, 45, 47, 5, 50, 51, 53, 57, 58, 59, 60, 63, 65, 67, 7, 71, 72, 74, 75, 76, 77, 8, 81, 82, 83, 84, 87, 89, 9, 91, 95, 96, 98, 99]
                diff is the missing nodes, these are the ones missing from a list [0,1,2,3,....max_num_in_hold_colour_array]
                diff is [6, 10, 15, 20, 23, 24, 26, 29, 30, 31, 32, 34, 37, 38, 39, 44, 46, 48, 49, 52, 54, 55, 56, 61, 62, 64, 66, 68, 69, 70, 73, 78, 79, 80, 85, 86, 88, 90, 92, 93, 94, 97, 102, 103, 104, 109, 110, 112, 114, 116, 117, 118, 121, 126, 127, 128, 133, 134, 136, 138, 140, 141, 142, 145, 150, 151, 152, 157, 158, 160, 162, 164, 165, 166, 169, 174, 175, 176, 181, 182, 183, 185, 188, 189, 193, 196, 197, 198, 202, 207, 208, 210]

                x is 0 count_missing 0 colour_array is #ffcccc
                x is 1 count_missing 0 colour_array is #ffcccc
                x is 100 count_missing 42 colour_array is #ffcccc
                x is 101 count_missing 42 colour_array is #ffffff
                x is 105 count_missing 45 colour_array is #d9f2d9
                .
                .
                real_index is what colour from colorarray should be used
                real index [0, 1, 58, 59, 60, 61, 62, 63, 9, 64, 65, 66, 67, 10, 68, 69, 70, 71, 72, 73, 11, 74, 75, 76, 77, 78, 79, 12, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 13, 91, 92, 93, 94, 14, 95, 96, 97, 98, 99, 100, 101, 15, 102, 103, 104, 105, 16, 106, 107, 108, 109, 110, 111, 2, 112, 113, 114, 115, 116, 117, 118, 17, 119, 18, 19, 20, 21, 3, 22, 23, 24, 4, 25, 26, 27, 28, 29, 30, 5, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 6, 41, 42, 43, 44, 45, 46, 7, 47, 48, 49, 50, 51, 52, 8, 53, 54, 55, 56, 57]
                """
                print("python: setting colours")
                nodes_length=0
                hold_colour_array=[]
                for v in g.vertices():
                    colour_index = int(g.vp.vertex_name[v])
                    hold_colour_array.append(colour_index)
                    nodes_length=nodes_length +1
                # now assign each of these vertex numbers a index
                # indexs greater than colour array since colour array does
                maxhold = max(hold_colour_array) # maximum to set shapes
                minhold = min(hold_colour_array)

                listofnum = list(range(max(hold_colour_array)))#create a list like [0,1,2,3, to max num in hold_colour array]
                diff = list(set(listofnum)-set(hold_colour_array))
                #for each number of the hold_colour_array, for up to that number we must find the number of numbers that have been excluded
                count_missing =0
                real_colour_index_array=[]
                for hca in hold_colour_array:
                    count_missing =0
                    for d in diff:
                        if(d<hca):
                            count_missing=count_missing+1
                    if((hca-count_missing)>=len(individColorArray)):# if the figure found is out of bounds fix to a particular point
                        print("python:out of bounds by "+str(hca-count_missing)+" fixing to 0")
                        real_colour_index_array.append(0); # should change so that it is crimson!
                    else:
                        real_colour_index_array.append((hca-count_missing)) # add the offset to the real_colour_index_array
                # setting colours now with property
                real_index=0 # just incrementer thru real_colour_index_array
                for vertex in g.vertices():
                    v_prop_colour[vertex]=individColorArray[real_colour_index_array[real_index]] # get the hex colour string
                    realnumber = int(g.vp.vertex_name[vertex])
                    if(realnumber==maxhold):
                        vshape[vertex]="square"
                    elif(realnumber==minhold):
                        vshape[vertex]="triangle"
                    else:
                        vshape[vertex]="circle"
                    real_index=real_index+1
                folderout=fcheckname    #"./public/pics/"+filename+".png"
                dimension_i=0
                dimension_ii=0
                # try simpler mechanism
                test0=2*lastIndex
                test1= int(test0)
                print("test1 is "+str(test1))
                if(test1 > 2000):
                    print("setting dimension_ii to 2000")
                    dimension_ii=2000
                elif(test1<100):
                    dimension_ii=500
                elif(test1<200):
                    dimension_ii=600
                elif(test1<300):
                    dimension_ii=850
                    print("setting dimension_ii to 200")
                elif(test1<500):
                    dimension_ii=1400
                    print("setting dimension_ii to 300")
                else:
                    print("default dimension_ii = test1")
                    dimension_ii=test1


                print("python: setting dimension_ii as "+ str(dimension_ii))

            except:
                print("python: error defining vertices!!")
            #now actually draw graph and save to folderout
            # graph_draw(g, vertex_text= v_prop, vertex_font_size=8, edge_color=edge_des_color,output=folderout) #vertex_text=v_prop, to show labels on nodes
            #pos = arf_layout(g,max_iter=1000) #output_size=(size_dim_1,size_dim_1)
            try:
                #overridin for debugging delete
                dimension_ii=1000
                graph_draw(g, vertex_fill_color=v_prop_colour, vertex_shape=vshape, edge_color=edge_des_color,output_size=(dimension_ii,dimension_ii), output=folderout) #vertex_text=v_prop, to show labels on nodes
            except:
                print("python: error drawing graph")


            #new section to update mongo to say that the graph has been generated
            data =[{"randomHash":str(filename)}]
            print("python: attempting to update "+str(filename))
            toupdate=str(filename)
            for d in data:
                coll.update( {"randomHash": toupdate},{"$set": {"graphToolsGen": 1}})
                print("python: updated generated_graph field in DB for "+ toupdate)
        i=i+1 # this is counter for x in y
        #now delete the file on dis
        print("python: deleting temp file "+filename)
        os.remove(filename)



    print("python: done succesfully")

#start process
if __name__ == '__main__':
    main()
