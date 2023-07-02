#!/usr/bin/env python

with open("words_alpha.txt") as input:
    with open("words_alpha.json", "w") as json:
        json.write("{")
        first = True
        for line in input:
            if first:
                first = False
            else:
                json.write(",")
            json.write("\"" + line.strip().upper() + "\":true")
        json.write("}")
